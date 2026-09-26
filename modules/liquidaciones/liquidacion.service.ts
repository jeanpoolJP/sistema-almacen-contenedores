// modules\liquidaciones\liquidacion.service.ts

import { Prisma } from "@/lib/generated/prisma"
import { prisma } from "@/lib/prisma"
import { liquidacionRepository } from "./liquidacion.repository"
import {
  confirmarLiquidacionSchema,
  createLiquidacionSchema,
  listLiquidacionesSchema,
  registrarPagoLiquidacionSchema,
  updateLiquidacionDetallesSchema,
} from "./liquidacion.schema"
import { LiquidacionErrors } from "./liquidacion.errors"
import type {
  GuiaDisponible,
  LiquidacionDetalle,
  LiquidacionListItem,
} from "./liquidacion.types"

function toNumber(v: Prisma.Decimal | number | null | undefined): number {
  if (v === null || v === undefined) return 0
  return typeof v === "number" ? v : Number(v.toString())
}

export const liquidacionService = {
  async list(input: unknown) {
    const { clienteId, estado, desde, hasta, page, pageSize } =
      listLiquidacionesSchema.parse(input)

    const where: Prisma.LiquidacionWhereInput = {}
    if (clienteId) where.clienteId = clienteId
    if (estado) where.estado = estado
    if (desde || hasta) {
      where.fechaCorte = {}
      if (desde) where.fechaCorte.gte = desde
      if (hasta) where.fechaCorte.lte = hasta
    }

    const [rows, total] = await Promise.all([
      liquidacionRepository.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      liquidacionRepository.count(where),
    ])

    const items: LiquidacionListItem[] = rows.map((l) => ({
      id: l.id,
      numero: l.numero,
      clienteId: l.clienteId,
      clienteNombre: l.cliente.nombreCompleto ?? "",
      clienteDocumento: l.cliente.numeroDocumento,
      fechaCorte: l.fechaCorte,
      estado: l.estado,
      cantidadGuias: l.cantidadGuias,
      montoTotal: toNumber(l.montoTotal),
      createdAt: l.createdAt,
    }))

    return { items, total, page, pageSize }
  },

  async getById(id: number): Promise<LiquidacionDetalle> {
    const l = await liquidacionRepository.findById(id)
    if (!l) throw LiquidacionErrors.notFound(id)

    return {
      id: l.id,
      numero: l.numero,
      clienteId: l.clienteId,
      clienteNombre: l.cliente.nombreCompleto ?? "",
      clienteDocumento: l.cliente.numeroDocumento,
      fechaCorte: l.fechaCorte,
      estado: l.estado,
      cantidadGuias: l.cantidadGuias,
      montoTotal: toNumber(l.montoTotal),
      createdAt: l.createdAt,
      subtotal: toNumber(l.subtotal),
      porcentajeIGV: toNumber(l.porcentajeIGV),
      montoIGV: toNumber(l.montoIGV),
      metodoPago: l.metodoPago,
      numeroOperacion: l.numeroOperacion,
      fechaPago: l.fechaPago,
      observaciones: l.observaciones,
      confirmadaAt: l.confirmadaAt,
      detalles: l.detalles.map((d) => ({
        id: d.id,
        guiaId: d.guiaId,
        numeroGuia: d.numeroGuia,
        marcaContenedor: d.marcaContenedor,
        numeroContenedor: d.numeroContenedor,
        medidaContenedor: d.medidaContenedor,
        tipoContenedor: d.tipoContenedor,
        fechaIngreso: d.fechaIngreso,
        fechaSalida: d.fechaSalida,
        precioIngresoSalida: d.precioIngresoSalida
          ? toNumber(d.precioIngresoSalida)
          : null,
        cantidadMovimientos: d.cantidadMovimientos,
        subtotalMovimientos: d.subtotalMovimientos
          ? toNumber(d.subtotalMovimientos)
          : null,
        montoTotalGuia: toNumber(d.montoTotalGuia),
      })),
    }
  },

  async getGuiasDisponibles(clienteId: number): Promise<GuiaDisponible[]> {
    const guias = await liquidacionRepository.findGuiasDisponibles(clienteId)
    return guias.map((g) => ({
      id: g.id,
      numeroGuia: g.numeroGuia,
      marcaContenedor: g.contenedor.marca,
      numeroContenedor: g.contenedor.numeroContenedor,
      medidaContenedor: g.contenedor.medida,
      tipoContenedor: g.contenedor.tipo,
      fechaIngreso: g.fechaIngreso,
      fechaSalida: g.fechaSalida,
      precioIngresoSalida: g.precioIngresoSalida
        ? toNumber(g.precioIngresoSalida)
        : null,
      cantidadMovimientos: g.cantidadMovimientos,
      subtotalMovimientos: g.subtotalMovimientos
        ? toNumber(g.subtotalMovimientos)
        : null,
      montoTotal: toNumber(g.montoTotal),
    }))
  },

  /** Devuelve la entidad ya serializable (sin Decimal). */
  async create(input: unknown): Promise<LiquidacionDetalle> {
    const data = createLiquidacionSchema.parse(input)
    const numero = await liquidacionRepository.generateNumero()

    const created = await liquidacionRepository.create({
      numero,
      fechaCorte: data.fechaCorte,
      observaciones: data.observaciones ?? null,
      estado: "BORRADOR",
      cliente: { connect: { id: data.clienteId } },
    })

    // Devolvemos el DTO serializable (mismo shape que getById)
    return this.getById(created.id)
  },

  async updateDetalles(input: unknown): Promise<LiquidacionDetalle> {
    const data = updateLiquidacionDetallesSchema.parse(input)

    const liquidacion = await liquidacionRepository.findById(data.liquidacionId)
    if (!liquidacion) throw LiquidacionErrors.notFound(data.liquidacionId)
    if (liquidacion.estado !== "BORRADOR") {
      throw LiquidacionErrors.invalidState("BORRADOR", liquidacion.estado)
    }

    const guias = await liquidacionRepository.findGuiasByIds(data.guiaIds)
    if (guias.length !== data.guiaIds.length) {
      const found = new Set(guias.map((g) => g.id))
      const missing = data.guiaIds.filter((id) => !found.has(id))
      throw LiquidacionErrors.notFound(missing[0] ?? data.liquidacionId)
    }

    for (const g of guias) {
      if (g.estado !== "RETIRADO")
        throw LiquidacionErrors.guideNotAvailable(g.numeroGuia)
      if (g.estadoPago !== "PENDIENTE")
        throw LiquidacionErrors.guideAlreadyPaid(g.numeroGuia)
      if (g.clienteId !== liquidacion.clienteId) {
        throw LiquidacionErrors.guideWrongClient(g.numeroGuia)
      }
    }

    const yaLiquidadas = await prisma.liquidacionDetalle.findMany({
      where: {
        guiaId: { in: data.guiaIds },
        NOT: { liquidacionId: data.liquidacionId },
      },
      select: { numeroGuia: true },
    })
    if (yaLiquidadas.length > 0) {
      throw LiquidacionErrors.guideAlreadyLiquidated(
        yaLiquidadas.map((d) => d.numeroGuia)
      )
    }

    const subtotal = guias.reduce((acc, g) => acc + toNumber(g.montoTotal), 0)
    const porcentajeIGV = 0
    const montoIGV = 0
    const montoTotal = subtotal + montoIGV

    await prisma.$transaction(async (tx) => {
      await tx.liquidacionDetalle.deleteMany({
        where: { liquidacionId: data.liquidacionId },
      })

      await tx.liquidacionDetalle.createMany({
        data: guias.map((g) => ({
          liquidacionId: data.liquidacionId,
          guiaId: g.id,
          numeroGuia: g.numeroGuia,
          marcaContenedor: g.contenedor.marca,
          numeroContenedor: g.contenedor.numeroContenedor,
          medidaContenedor: g.contenedor.medida,
          tipoContenedor: g.contenedor.tipo,
          fechaIngreso: g.fechaIngreso,
          fechaSalida: g.fechaSalida,
          precioIngresoSalida: g.precioIngresoSalida,
          cantidadMovimientos: g.cantidadMovimientos,
          subtotalMovimientos: g.subtotalMovimientos,
          montoTotalGuia: g.montoTotal ?? 0,
        })),
      })

      await tx.liquidacion.update({
        where: { id: data.liquidacionId },
        data: {
          cantidadGuias: guias.length,
          subtotal,
          porcentajeIGV,
          montoIGV,
          montoTotal,
        },
      })
    })

    return this.getById(data.liquidacionId)
  },

  async confirmar(input: unknown): Promise<LiquidacionDetalle> {
    const { liquidacionId } = confirmarLiquidacionSchema.parse(input)
    const l = await liquidacionRepository.findById(liquidacionId)
    if (!l) throw LiquidacionErrors.notFound(liquidacionId)
    if (l.estado !== "BORRADOR") {
      throw LiquidacionErrors.invalidState("BORRADOR", l.estado)
    }
    if (l.detalles.length === 0) throw LiquidacionErrors.empty()

    await liquidacionRepository.update(liquidacionId, {
      estado: "CONFIRMADA",
      confirmadaAt: new Date(),
    })

    return this.getById(liquidacionId)
  },

  async registrarPago(input: unknown): Promise<LiquidacionDetalle> {
    const data = registrarPagoLiquidacionSchema.parse(input)

    await prisma.$transaction(async (tx) => {
      const l = await tx.liquidacion.findUnique({
        where: { id: data.liquidacionId },
        include: { detalles: true },
      })
      if (!l) throw LiquidacionErrors.notFound(data.liquidacionId)
      if (l.estado === "PAGADA") throw LiquidacionErrors.alreadyPaid()
      if (l.estado !== "CONFIRMADA") {
        throw LiquidacionErrors.invalidState("CONFIRMADA", l.estado)
      }

      const guiaIds = l.detalles.map((d) => d.guiaId)

      const guiasPagadas = await tx.guiaInternamiento.findMany({
        where: { id: { in: guiaIds }, estadoPago: "PAGADO" },
        select: { numeroGuia: true },
      })
      if (guiasPagadas.length > 0) {
        throw LiquidacionErrors.guideAlreadyPaid(
          guiasPagadas.map((g) => g.numeroGuia).join(", ")
        )
      }

      await tx.guiaInternamiento.updateMany({
        where: { id: { in: guiaIds } },
        data: {
          estadoPago: "PAGADO",
          metodoPago: data.metodoPago,
          numeroOperacion: data.numeroOperacion,
          fechaPago: data.fechaPago,
          horaPago: data.fechaPago,
        },
      })

      await tx.liquidacion.update({
        where: { id: data.liquidacionId },
        data: {
          estado: "PAGADA",
          metodoPago: data.metodoPago,
          numeroOperacion: data.numeroOperacion,
          fechaPago: data.fechaPago,
          observaciones: data.observaciones ?? l.observaciones,
        },
      })
    })

    return this.getById(data.liquidacionId)
  },

  async anular(id: number): Promise<LiquidacionDetalle> {
    const l = await liquidacionRepository.findById(id)
    if (!l) throw LiquidacionErrors.notFound(id)
    if (l.estado === "PAGADA") throw LiquidacionErrors.alreadyPaid()
    if (l.estado === "ANULADA") return this.getById(id)

    await prisma.$transaction(async (tx) => {
      await tx.liquidacionDetalle.deleteMany({ where: { liquidacionId: id } })
      await tx.liquidacion.update({
        where: { id },
        data: {
          estado: "ANULADA",
          cantidadGuias: 0,
          subtotal: 0,
          montoIGV: 0,
          montoTotal: 0,
        },
      })
    })

    return this.getById(id)
  },
}
