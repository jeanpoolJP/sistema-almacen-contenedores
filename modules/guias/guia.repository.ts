// modules/guias/guia.repository.ts

import { prisma } from "@/lib/prisma"

import type { CrearGuiaRepositoryInput } from "./guia.types"

import {
  EstadoGuia,
  EstadoPago,
  MetodoPago,
  Prisma,
  TipoPrecioGuia,
  TratamientoIGV,
} from "@/lib/generated/prisma"

/**
 * Crea una guía de internamiento.
 *
 * Este repository NO busca ni crea clientes,
 * contenedores, vehículos, conductores, etc.
 *
 * Esa responsabilidad pertenece al service.
 */
export async function crearGuia(data: CrearGuiaRepositoryInput) {
  return prisma.guiaInternamiento.create({
    data: {
      numeroGuia: data.numeroGuia,

      clienteId: data.clienteId ?? null,

      contenedorId: data.contenedorId,

      empresaTransporteIngresoId: data.empresaTransporteIngresoId,

      vehiculoIngresoId: data.vehiculoIngresoId,

      conductorIngresoId: data.conductorIngresoId,

      fechaIngreso: data.fechaIngreso,

      horaIngreso: data.horaIngreso,

      tipoPrecio: data.tipoPrecio,

      precioPrimerDia: data.precioPrimerDia ?? 0,
      precioDiaAdicional: data.precioDiaAdicional ?? 0,

      precioIngresoSalida: data.precioIngresoSalida ?? null,

      porcentajeIGV: data.porcentajeIGV,

      tratamientoIGV: data.tratamientoIGV,

      estado: data.estado,

      observaciones: data.observaciones ?? null,
    },

    include: {
      cliente: true,

      contenedor: true,

      empresaTransporteIngreso: true,

      vehiculoIngreso: true,

      conductorIngreso: true,

      empresaTransporteSalida: true,

      vehiculoSalida: true,

      conductorSalida: true,
    },
  })
}

/**
 * Busca una guía por ID.
 */
export async function obtenerGuiaPorId(id: number) {
  return prisma.guiaInternamiento.findUnique({
    where: {
      id,
    },

    include: {
      cliente: true,
      contenedor: true,

      empresaTransporteIngreso: true,
      vehiculoIngreso: true,
      conductorIngreso: true,

      empresaTransporteSalida: true,
      vehiculoSalida: true,
      conductorSalida: true,
    },
  })
}

/**
 * Busca una guía por número.
 */
export async function obtenerGuiaPorNumero(numeroGuia: string) {
  return prisma.guiaInternamiento.findUnique({
    where: {
      numeroGuia,
    },

    include: {
      cliente: true,
      contenedor: true,

      empresaTransporteIngreso: true,
      vehiculoIngreso: true,
      conductorIngreso: true,

      empresaTransporteSalida: true,
      vehiculoSalida: true,
      conductorSalida: true,
    },
  })
}

/**
 * Parámetros para obtener las guías.
 */

type ObtenerGuiasParams = {
  pagina: number
  limite: number

  numeroGuia?: string
  numeroContenedor?: string
  documentoCliente?: string

  sinCliente?: boolean

  estado?: EstadoGuia
  estadoPago?: EstadoPago
  tratamientoIGV?: TratamientoIGV

  fechaDesde?: Date
  fechaHasta?: Date
}

/**
 * Obtiene las guías con paginación y filtros.
 */
export async function obtenerGuias({
  pagina,
  limite,
  numeroGuia,
  numeroContenedor,
  documentoCliente,
  sinCliente,
  estado,
  estadoPago,
  tratamientoIGV,
  fechaDesde,
  fechaHasta,
}: ObtenerGuiasParams) {
  const where: Prisma.GuiaInternamientoWhereInput = {
    ...(numeroGuia && {
      numeroGuia: {
        contains: numeroGuia,
        mode: "insensitive",
      },
    }),

    ...(numeroContenedor && {
      contenedor: {
        numeroContenedor: {
          contains: numeroContenedor,
          mode: "insensitive",
        },
      },
    }),

    ...(documentoCliente && {
      cliente: {
        numeroDocumento: {
          contains: documentoCliente,
          mode: "insensitive",
        },
      },
    }),

    ...(sinCliente && {
      clienteId: null,
    }),

    ...(estado && {
      estado,
    }),

    ...(estadoPago && {
      estadoPago,
    }),

    ...(tratamientoIGV && {
      tratamientoIGV,
    }),

    ...(fechaDesde || fechaHasta
      ? {
          fechaIngreso: {
            ...(fechaDesde && {
              gte: fechaDesde,
            }),

            ...(fechaHasta && {
              lte: fechaHasta,
            }),
          },
        }
      : {}),
  }

  const [guias, total] = await prisma.$transaction([
    prisma.guiaInternamiento.findMany({
      where,

      include: {
        cliente: true,
        contenedor: true,

        empresaTransporteIngreso: true,
        vehiculoIngreso: true,
        conductorIngreso: true,

        empresaTransporteSalida: true,
        vehiculoSalida: true,
        conductorSalida: true,
      },

      orderBy: {
        createdAt: "desc",
      },

      skip: (pagina - 1) * limite,

      take: limite,
    }),

    prisma.guiaInternamiento.count({
      where,
    }),
  ])

  return {
    guias,
    total,
  }
}

/**
 * Actualiza una guía.
 */
export async function actualizarGuia(
  id: number,
  data: Record<string, unknown>
) {
  return prisma.guiaInternamiento.update({
    where: {
      id,
    },

    data,

    include: {
      cliente: true,
      contenedor: true,

      empresaTransporteIngreso: true,
      vehiculoIngreso: true,
      conductorIngreso: true,

      empresaTransporteSalida: true,
      vehiculoSalida: true,
      conductorSalida: true,
    },
  })
}

/**
 * Registra el pago de una guía.
 */
export async function registrarPagoGuia(
  id: number,
  data: {
    clienteId?: number | null

    estadoPago: EstadoPago

    metodoPago: MetodoPago

    numeroOperacion?: string | null

    fechaPago: Date

    horaPago: Date
  }
) {
  return prisma.guiaInternamiento.update({
    where: {
      id,
    },

    data: {
      // ==========================================================
      // CLIENTE
      // ==========================================================

      clienteId: data.clienteId ?? null,

      // ==========================================================
      // PAGO
      // ==========================================================

      estadoPago: data.estadoPago,

      metodoPago: data.metodoPago,

      numeroOperacion: data.numeroOperacion ?? null,

      fechaPago: data.fechaPago,

      horaPago: data.horaPago,
    },

    include: {
      cliente: true,

      contenedor: true,

      empresaTransporteIngreso: true,

      vehiculoIngreso: true,

      conductorIngreso: true,

      empresaTransporteSalida: true,

      vehiculoSalida: true,

      conductorSalida: true,
    },
  })
}

/**
 * Anula una guía.
 */
export async function anularGuia(id: number) {
  return prisma.guiaInternamiento.update({
    where: {
      id,
    },

    data: {
      estado: "ANULADO",
    },
  })
}
