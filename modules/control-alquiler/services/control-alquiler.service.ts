import { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { formatearNumeroGuia } from "@/modules/guias/utils/formatear-numero-guia"

import {
  actualizarGuiaAlquilerSchema,
  asignarClienteAlquilerSchema,
  cotizacionAlquilerSchema,
  guiaAlquilerSchema,
  listadoGuiasAlquilerSchema,
  pagoAlquilerSchema,
  type GuiaAlquilerInput,
  type ListadoGuiasAlquilerInput,
} from "../schemas/control-alquiler.schema"
import {
  actualizarGuiaAlquilerRepository,
  crearGuiaAlquilerRepository,
  guardarCotizacionAlquilerRepository,
  listarGuiasAlquilerRepository,
  listarOpcionesAlquilerRepository,
  registrarPagoAlquilerRepository,
} from "../repository/guia-alquiler.repository"
import { calcularTotalesCotizacion } from "@/modules/trasegados/utils/calcular-cotizacion"

function aFecha(fecha: string): Date {
  return new Date(`${fecha}T00:00:00.000Z`)
}

function aHora(hora: string): Date | null {
  return hora ? new Date(`1970-01-01T${hora}:00.000Z`) : null
}

function prepararDatos(datos: GuiaAlquilerInput) {
  return {
    ...datos,
    numeroGuia: formatearNumeroGuia(datos.numeroGuia),
    fechaInicio: aFecha(datos.fechaInicio),
    fechaFin: aFecha(datos.fechaFin),
    horaSalida: aHora(datos.horaSalida),
    horaInicio: aHora(datos.horaInicio),
    horaFinalizacion: aHora(datos.horaFinalizacion),
    horaRetorno: aHora(datos.horaRetorno),
  }
}

function obtenerMensajeUnico(error: unknown, fallback: string) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return "Ya existe una guía con ese número."
  }

  return fallback
}

export async function listarGuiasAlquilerService(
  input: ListadoGuiasAlquilerInput
) {
  const params = listadoGuiasAlquilerSchema.parse(input)
  const { guias, total } = await listarGuiasAlquilerRepository(params)

  return {
    items: guias.map((guia) => ({
      id: guia.id,
      numeroGuia: guia.numeroGuia,
      fechaInicio: guia.fechaInicio.toISOString().slice(0, 10),
      fechaFin: guia.fechaFin.toISOString().slice(0, 10),
      solicitante: guia.solicitante,
      horaSalida: guia.horaSalida?.toISOString().slice(11, 16) ?? "",
      horaInicio: guia.horaInicio?.toISOString().slice(11, 16) ?? "",
      horaFinalizacion:
        guia.horaFinalizacion?.toISOString().slice(11, 16) ?? "",
      horaRetorno: guia.horaRetorno?.toISOString().slice(11, 16) ?? "",
      subtotal: guia.subtotal === null ? null : Number(guia.subtotal),
      igv: guia.igv === null ? null : Number(guia.igv),
      total: guia.total === null ? null : Number(guia.total),
      modoIGVCotizacion: guia.modoIGVCotizacion,
      numeroCotizacion: guia.numeroCotizacion,
      estadoPago: guia.estadoPago,
      metodoPago: guia.metodoPago,
      numeroOperacion: guia.numeroOperacion,
      fechaPago: guia.fechaPago?.toISOString().slice(0, 10) ?? null,
      horaPago: guia.horaPago?.toISOString().slice(11, 16) ?? null,
      estado: guia.estado,
      cliente: guia.cliente,
      equipo: {
        ...guia.equipo,
        capacidadCarga:
          guia.equipo.capacidadCarga === null
            ? null
            : Number(guia.equipo.capacidadCarga),
      },
      operador: guia.operador,
      equipoId: guia.equipoId,
      operadorId: guia.operadorId,
      observaciones: guia.observaciones,
      createdAt: guia.createdAt.toISOString(),
      updatedAt: guia.updatedAt.toISOString(),
    })),
    total,
    pagina: params.pagina,
    limite: params.limite,
    totalPaginas: Math.max(1, Math.ceil(total / params.limite)),
  }
}

export async function obtenerOpcionesAlquilerService() {
  return listarOpcionesAlquilerRepository()
}

export async function crearGuiaAlquilerService(input: GuiaAlquilerInput) {
  const datos = guiaAlquilerSchema.parse(input)
  try {
    return await crearGuiaAlquilerRepository(prepararDatos(datos))
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new Error(
          obtenerMensajeUnico(error, "No se pudo guardar la guía.")
        )
      }
      if (error.code === "P2003") {
        throw new Error("El equipo o el operador seleccionado ya no existe.")
      }
    }
    throw error
  }
}

export async function actualizarGuiaAlquilerService(input: unknown) {
  const datos = actualizarGuiaAlquilerSchema.parse(input)
  const { id, ...guiaDatos } = datos

  try {
    return await actualizarGuiaAlquilerRepository(id, prepararDatos(guiaDatos))
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new Error("La guía de alquiler ya no existe.")
      }
      if (error.code === "P2002") {
        throw new Error(
          obtenerMensajeUnico(error, "No se pudo guardar la guía.")
        )
      }
      if (error.code === "P2003") {
        throw new Error("El equipo o el operador seleccionado ya no existe.")
      }
    }
    throw error
  }
}

export async function asignarClienteAlquilerService(input: unknown) {
  const datos = asignarClienteAlquilerSchema.parse(input)
  const clienteData = datos.clienteData
    ? {
        tipoDocumento: datos.clienteData.tipoDocumento,
        numeroDocumento: datos.clienteData.numeroDocumento.trim(),
        nombreCompleto: datos.clienteData.nombreCompleto?.trim() || null,
        telefono: datos.clienteData.telefono?.trim() || null,
        observaciones: datos.clienteData.observaciones?.trim() || null,
        activo: true,
      }
    : null

  try {
    return await prisma.$transaction(async (tx) => {
      const guia = await tx.guiaAlquiler.findUnique({
        where: { id: datos.guiaAlquilerId },
        select: { id: true },
      })
      if (!guia) {
        throw new Error("La guía de alquiler no existe.")
      }

      let clienteId: number

      if (datos.clienteId) {
        const cliente = await tx.cliente.findUnique({
          where: { id: datos.clienteId },
          select: { id: true, activo: true },
        })
        if (!cliente || !cliente.activo) {
          throw new Error("El cliente seleccionado no existe o está inactivo.")
        }

        if (clienteData) {
          const documentoEnUso = await tx.cliente.findUnique({
            where: { numeroDocumento: clienteData.numeroDocumento },
            select: { id: true },
          })
          if (documentoEnUso && documentoEnUso.id !== cliente.id) {
            throw new Error("Ese documento ya pertenece a otro cliente.")
          }
          await tx.cliente.update({
            where: { id: cliente.id },
            data: clienteData,
          })
        }
        clienteId = cliente.id
      } else if (clienteData) {
        const existente = await tx.cliente.findUnique({
          where: { numeroDocumento: clienteData.numeroDocumento },
          select: { id: true },
        })
        const cliente = existente
          ? await tx.cliente.update({
              where: { id: existente.id },
              data: clienteData,
              select: { id: true },
            })
          : await tx.cliente.create({
              data: clienteData,
              select: { id: true },
            })
        clienteId = cliente.id
      } else {
        throw new Error("Selecciona o registra un cliente.")
      }

      return tx.guiaAlquiler.update({
        where: { id: guia.id },
        data: { clienteId },
        select: { id: true, clienteId: true },
      })
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Ya existe un cliente con ese número de documento.")
    }
    throw error
  }
}

export async function guardarCotizacionAlquilerService(input: unknown) {
  const datos = cotizacionAlquilerSchema.parse(input)
  const totales = calcularTotalesCotizacion(
    datos.montoIngresado,
    datos.modoIGVCotizacion
  )

  try {
    return await guardarCotizacionAlquilerRepository({
      guiaAlquilerId: datos.guiaAlquilerId,
      numeroCotizacion: datos.numeroCotizacion,
      modoIGVCotizacion: datos.modoIGVCotizacion,
      subtotal: totales.subtotal,
      igv: totales.montoIGV,
      total: totales.totalPagar,
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new Error("La guía de alquiler ya no existe.")
    }
    throw error
  }
}

export async function registrarPagoAlquilerService(input: unknown) {
  const datos = pagoAlquilerSchema.parse(input)
  const guia = await prisma.guiaAlquiler.findUnique({
    where: { id: datos.guiaAlquilerId },
    select: {
      id: true,
      numeroGuia: true,
      numeroCotizacion: true,
      total: true,
    },
  })

  if (!guia) {
    throw new Error("La guía de alquiler ya no existe.")
  }

  if (!guia.numeroCotizacion || guia.total === null) {
    throw new Error(
      "Asigna una cotización y su monto antes de registrar el pago."
    )
  }

  try {
    const { guiaAlquilerId, ...pago } = datos
    return await registrarPagoAlquilerRepository(guiaAlquilerId, pago)
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new Error("La guía de alquiler ya no existe.")
    }
    throw error
  }
}
