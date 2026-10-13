// modules/control-alquiler/control-alquiler.service.ts
import { Prisma } from "@/lib/generated/prisma/client"

import {
  asignarClienteGuiaAlquiler,
  asignarCotizacionGuiaAlquiler,
  asignarPagoGuiaAlquiler,
  countGuiasAlquiler,
  createCliente,
  createGuiaAlquiler,
  findClienteByDocumento,
  findGuiaAlquilerById,
  findGuiaAlquilerByNumero,
  findGuiasAlquiler,
  updateGuiaAlquiler,
} from "./control-alquiler.repository"

import {
  asignarClienteSchema,
  cambiarEstadoGuiaAlquilerSchema,
  cotizacionSchema,
  filtrosGuiaAlquilerSchema,
  guiaAlquilerSchema,
  pagoGuiaAlquilerSchema,
} from "./control-alquiler.schema"

import type {
  AsignarClienteFormData,
  CambiarEstadoGuiaAlquilerFormData,
  CotizacionFormData,
  FiltrosGuiaAlquiler,
  GuiaAlquilerFormData,
  PagoGuiaAlquilerFormData,
} from "./control-alquiler.schema"

import type {
  GuiaAlquilerListItem,
  GuiaAlquilerPaginado,
} from "./control-alquiler.types"

import {
  calcularCotizacion,
  calcularImporteAlquiler,
  calcularHorasServicio,
  calcularHorasUsoMaquina,
  dateATimeString,
  normalizarNumeroGuia,
  serializarGuiaAlquiler,
} from "./utils/control-alquiler.utils"

// ============================================================
// HELPERS
// ============================================================

/** Convierte "HH:mm" a Date anclado a 1970-01-01 (para campos Time de Prisma) */
function timeStringADate(hora: string | null): Date | null {
  if (!hora) return null
  const [hh, mm] = hora.split(":").map(Number)
  const d = new Date(Date.UTC(1970, 0, 1, hh, mm, 0, 0))
  return d
}

/** Convierte "YYYY-MM-DD" a Date UTC */
function fechaStringADate(fecha: Date): Date {
  return new Date(
    Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate())
  )
}

function calcularTotalesAlquiler(
  horasServicio: number | null,
  horasMinimas: number | null,
  precioPorHora: number | null,
  modoIGVCotizacion: "SIN_IGV" | "CON_IGV" | "IGV_INCLUIDO"
) {
  const importe = calcularImporteAlquiler(
    horasServicio,
    horasMinimas,
    precioPorHora
  )

  return importe == null ? null : calcularCotizacion(importe, modoIGVCotizacion)
}

function construirWhere(f: FiltrosGuiaAlquiler): Prisma.GuiaAlquilerWhereInput {
  const condiciones: Prisma.GuiaAlquilerWhereInput[] = []

  if (f.busqueda) {
    const b = f.busqueda
    condiciones.push({
      OR: [
        { numeroGuia: { contains: b, mode: "insensitive" } },
        { solicitante: { contains: b, mode: "insensitive" } },
        { lugarServicio: { contains: b, mode: "insensitive" } },
        { numeroCotizacion: { contains: b, mode: "insensitive" } },
        { nombreOperadorExterno: { contains: b, mode: "insensitive" } },
        {
          cliente: {
            OR: [
              { nombreCompleto: { contains: b, mode: "insensitive" } },
              { numeroDocumento: { contains: b, mode: "insensitive" } },
            ],
          },
        },
        {
          equipo: {
            OR: [
              { codigo: { contains: b, mode: "insensitive" } },
              { nombre: { contains: b, mode: "insensitive" } },
            ],
          },
        },
      ],
    })
  }

  if (f.estado !== "todos") condiciones.push({ estado: f.estado })
  if (f.estadoPago !== "todos") condiciones.push({ estadoPago: f.estadoPago })
  if (f.cotizacion === "con")
    condiciones.push({ numeroCotizacion: { not: null } })
  if (f.cotizacion === "sin") condiciones.push({ numeroCotizacion: null })

  if (f.desde || f.hasta) {
    const rango: Prisma.DateTimeFilter = {}
    if (f.desde) rango.gte = new Date(`${f.desde}T00:00:00.000Z`)
    if (f.hasta) rango.lte = new Date(`${f.hasta}T23:59:59.999Z`)
    condiciones.push({ fechaInicio: rango })
  }

  return condiciones.length ? { AND: condiciones } : {}
}

// ============================================================
// LISTAR / BUSCAR
// ============================================================

export async function listarGuiasAlquiler(
  filtros: FiltrosGuiaAlquiler = {} as FiltrosGuiaAlquiler
): Promise<GuiaAlquilerPaginado> {
  const f = filtrosGuiaAlquilerSchema.parse(filtros)
  const where = construirWhere(f)

  const [resultados, total] = await Promise.all([
    findGuiasAlquiler(where, (f.pagina - 1) * f.porPagina, f.porPagina),
    countGuiasAlquiler(where),
  ])

  const guias: GuiaAlquilerListItem[] = resultados.map(serializarGuiaAlquiler)

  return {
    guias,
    total,
    pagina: f.pagina,
    porPagina: f.porPagina,
    totalPaginas: Math.max(1, Math.ceil(total / f.porPagina)),
  }
}

export async function obtenerGuiaAlquiler(id: string) {
  if (!id) throw new Error("ID inválido")
  const guia = await findGuiaAlquilerById(id)
  if (!guia) return null
  return serializarGuiaAlquiler(guia)
}

// ============================================================
// CREAR / ACTUALIZAR
// ============================================================

export async function registrarGuiaAlquiler(data: GuiaAlquilerFormData) {
  const d = guiaAlquilerSchema.parse(data)

  // Verificar número de guía único
  const existente = await findGuiaAlquilerByNumero(d.numeroGuia)
  if (existente) {
    throw new Error(`Ya existe una guía con el número ${d.numeroGuia}`)
  }

  // Cálculos automáticos
  const horasServicio = calcularHorasServicio(d.horaSalida, d.horaRetorno)
  const horasUsoMaquina = calcularHorasUsoMaquina(
    d.horometroInicial,
    d.horometroFinal
  )
  const totales = calcularTotalesAlquiler(
    horasServicio,
    d.horasMinimas,
    d.precioPorHora,
    d.modoIGVCotizacion
  )

  const creada = await createGuiaAlquiler({
    numeroGuia: d.numeroGuia,
    fechaInicio: fechaStringADate(d.fechaInicio),
    fechaFin: fechaStringADate(d.fechaFin),
    descripcionServicio: d.descripcionServicio,
    solicitante: d.solicitante,
    lugarServicio: d.lugarServicio,

    horaSalida: timeStringADate(d.horaSalida),
    horaInicio: timeStringADate(d.horaInicio),
    horaFinalizacion: timeStringADate(d.horaFinalizacion),
    horaRetorno: timeStringADate(d.horaRetorno),

    horasServicio: horasServicio ?? undefined,
    horasMinimas: d.horasMinimas ?? undefined,
    precioPorHora: d.precioPorHora ?? undefined,
    numeroCotizacion: d.numeroCotizacion,
    subtotal: totales ? new Prisma.Decimal(totales.subtotal) : null,
    igv: totales ? new Prisma.Decimal(totales.igv) : null,
    total: totales ? new Prisma.Decimal(totales.total) : null,
    modoIGVCotizacion: d.modoIGVCotizacion,

    horometroInicial: d.horometroInicial ?? undefined,
    horometroFinal: d.horometroFinal ?? undefined,
    horasUsoMaquina: horasUsoMaquina ?? undefined,

    estado: d.estado,
    observaciones: d.observaciones,

    clienteId: d.clienteId ?? undefined,
    equipoId: d.equipoId,
    operadorId: d.operadorId ?? undefined,
    nombreOperadorExterno: d.nombreOperadorExterno,
  })

  return serializarGuiaAlquiler(creada)
}

export async function actualizarGuiaAlquiler(
  id: string,
  data: GuiaAlquilerFormData
) {
  const d = guiaAlquilerSchema.parse(data)

  const actual = await findGuiaAlquilerById(id)
  if (!actual) throw new Error("La guía no existe")

  if (d.numeroGuia !== actual.numeroGuia) {
    const existente = await findGuiaAlquilerByNumero(d.numeroGuia)
    if (existente) {
      throw new Error(`Ya existe una guía con el número ${d.numeroGuia}`)
    }
  }

  const horasServicio = calcularHorasServicio(d.horaSalida, d.horaRetorno)
  const horasUsoMaquina = calcularHorasUsoMaquina(
    d.horometroInicial,
    d.horometroFinal
  )
  const totales = calcularTotalesAlquiler(
    horasServicio,
    d.horasMinimas,
    d.precioPorHora,
    d.modoIGVCotizacion
  )

  const actualizada = await updateGuiaAlquiler(id, {
    numeroGuia: d.numeroGuia,
    fechaInicio: fechaStringADate(d.fechaInicio),
    fechaFin: fechaStringADate(d.fechaFin),
    descripcionServicio: d.descripcionServicio,
    solicitante: d.solicitante,
    lugarServicio: d.lugarServicio,

    horaSalida: timeStringADate(d.horaSalida),
    horaInicio: timeStringADate(d.horaInicio),
    horaFinalizacion: timeStringADate(d.horaFinalizacion),
    horaRetorno: timeStringADate(d.horaRetorno),

    horasServicio: horasServicio ?? null,
    horasMinimas: d.horasMinimas ?? null,
    precioPorHora: d.precioPorHora ?? null,
    numeroCotizacion: d.numeroCotizacion,
    subtotal: totales ? new Prisma.Decimal(totales.subtotal) : null,
    igv: totales ? new Prisma.Decimal(totales.igv) : null,
    total: totales ? new Prisma.Decimal(totales.total) : null,
    modoIGVCotizacion: d.modoIGVCotizacion,

    horometroInicial: d.horometroInicial ?? null,
    horometroFinal: d.horometroFinal ?? null,
    horasUsoMaquina: horasUsoMaquina ?? null,

    estado: d.estado,
    observaciones: d.observaciones,

    clienteId: d.clienteId ?? null,
    equipoId: d.equipoId,
    operadorId: d.operadorId ?? null,
    nombreOperadorExterno: d.nombreOperadorExterno,
  })

  return serializarGuiaAlquiler(actualizada)
}

// ============================================================
// ASIGNAR CLIENTE (existente o nuevo)
// ============================================================

export async function asignarCliente(
  guiaId: string,
  data: AsignarClienteFormData
) {
  const d = asignarClienteSchema.parse(data)

  const guia = await findGuiaAlquilerById(guiaId)
  if (!guia) throw new Error("La guía no existe")

  let clienteId: number

  if (d.modo === "existente") {
    clienteId =
      typeof d.clienteId === "string" ? Number(d.clienteId) : d.clienteId!
    if (!Number.isInteger(clienteId) || clienteId <= 0) {
      throw new Error("Cliente inválido")
    }
  } else {
    // Cliente nuevo: verificar documento
    const numero = d.numeroDocumento!.trim()
    const existente = await findClienteByDocumento(numero)
    if (existente) {
      // Ya existe: lo asignamos directamente
      clienteId = existente.id
    } else {
      const nuevo = await createCliente({
        tipoDocumento: d.tipoDocumento!,
        numeroDocumento: numero,
        nombreCompleto: d.nombreCompleto!.trim(),
        telefono: d.telefono?.trim() || null,
        observaciones: d.observaciones?.trim() || null,
        activo: true,
      })
      clienteId = nuevo.id
    }
  }

  const actualizada = await asignarClienteGuiaAlquiler(guiaId, clienteId)
  return serializarGuiaAlquiler(actualizada)
}

// ============================================================
// ASIGNAR COTIZACIÓN
// ============================================================

export async function asignarCotizacion(
  guiaId: string,
  data: CotizacionFormData
) {
  const d = cotizacionSchema.parse(data)

  const guia = await findGuiaAlquilerById(guiaId)
  if (!guia) throw new Error("La guía no existe")

  const { subtotal, igv, total } = calcularCotizacion(
    d.subtotal,
    d.modoIGVCotizacion
  )

  const actualizada = await asignarCotizacionGuiaAlquiler(guiaId, {
    numeroCotizacion: d.numeroCotizacion,
    subtotal: new Prisma.Decimal(subtotal),
    igv: new Prisma.Decimal(igv),
    total: new Prisma.Decimal(total),
    modoIGVCotizacion: d.modoIGVCotizacion,
  })

  return serializarGuiaAlquiler(actualizada)
}

// ============================================================
// ASIGNAR PAGO
// ============================================================

export async function asignarPago(
  guiaId: string,
  data: PagoGuiaAlquilerFormData
) {
  const d = pagoGuiaAlquilerSchema.parse(data)

  const guia = await findGuiaAlquilerById(guiaId)
  if (!guia) throw new Error("La guía no existe")

  const fechaPago = fechaStringADate(d.fechaPago)
  const horaPago = timeStringADate(d.horaPago)!

  const actualizada = await asignarPagoGuiaAlquiler(guiaId, {
    metodoPago: d.metodoPago,
    numeroOperacion: d.numeroOperacion,
    fechaPago,
    horaPago,
    estadoPago: "PAGADO",
  })

  return serializarGuiaAlquiler(actualizada)
}

// ============================================================
// CAMBIAR ESTADO
// ============================================================

export async function cambiarEstadoGuiaAlquiler(
  guiaId: string,
  data: CambiarEstadoGuiaAlquilerFormData
) {
  const d = cambiarEstadoGuiaAlquilerSchema.parse(data)

  const guia = await findGuiaAlquilerById(guiaId)
  if (!guia) throw new Error("La guía no existe")

  const actualizada = await updateGuiaAlquiler(guiaId, { estado: d.estado })
  return serializarGuiaAlquiler(actualizada)
}
