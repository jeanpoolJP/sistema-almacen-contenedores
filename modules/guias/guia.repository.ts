// modules/guias/guia.repository.ts

import { prisma } from "@/lib/prisma"

import type { CrearGuiaRepositoryInput } from "./guia.types"
import {
  createClienteTx,
  findClienteByDocumentoTx,
} from "@/modules/clientes/cliente.repository"

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
  medidaContenedor?: 20 | 40
  documentoCliente?: string

  sinCliente?: boolean

  estado?: EstadoGuia
  estadoPago?: EstadoPago
  tratamientoIGV?: TratamientoIGV

  fechaIngresoDesde?: string
  fechaIngresoHasta?: string
  fechaSalidaDesde?: string
  fechaSalidaHasta?: string
  fechaDesde?: Date
  fechaHasta?: Date
}

function fechaCalendarioUtc(fecha: string, finDelDia = false) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw new Error("La fecha debe tener el formato YYYY-MM-DD")
  }

  return new Date(`${fecha}T${finDelDia ? "23:59:59.999" : "00:00:00.000"}Z`)
}

/**
 * Obtiene las guías con paginación y filtros.
 */
export async function obtenerGuias({
  pagina,
  limite,
  numeroGuia,
  numeroContenedor,
  medidaContenedor,
  documentoCliente,
  sinCliente,
  estado,
  estadoPago,
  tratamientoIGV,
  fechaIngresoDesde,
  fechaIngresoHasta,
  fechaSalidaDesde,
  fechaSalidaHasta,
  fechaDesde,
  fechaHasta,
}: ObtenerGuiasParams) {
  const ingresoDesde = fechaIngresoDesde
    ? fechaCalendarioUtc(fechaIngresoDesde)
    : fechaDesde
  const ingresoHasta = fechaIngresoHasta
    ? fechaCalendarioUtc(fechaIngresoHasta, true)
    : fechaHasta

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
        ...(medidaContenedor && {
          medida: medidaContenedor,
        }),
      },
    }),

    ...(medidaContenedor &&
      !numeroContenedor && {
        contenedor: {
          medida: medidaContenedor,
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

    ...(ingresoDesde || ingresoHasta
      ? {
          fechaIngreso: {
            ...(ingresoDesde && {
              gte: ingresoDesde,
            }),

            ...(ingresoHasta && {
              lte: ingresoHasta,
            }),
          },
        }
      : {}),

    ...(fechaSalidaDesde || fechaSalidaHasta
      ? {
          fechaSalida: {
            ...(fechaSalidaDesde && {
              gte: fechaCalendarioUtc(fechaSalidaDesde),
            }),

            ...(fechaSalidaHasta && {
              lte: fechaCalendarioUtc(fechaSalidaHasta, true),
            }),
          },
        }
      : {}),
  }

  const [guias, total] = await Promise.all([
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
        updatedAt: "desc",
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
    estadoPago: EstadoPago
    metodoPago: MetodoPago
    numeroOperacion?: string | null
    fechaPago: Date
    horaPago: Date
    clienteId?: number | null
  }
) {
  return prisma.guiaInternamiento.update({
    where: {
      id,
    },

    data: {
      ...(data.clienteId !== undefined && {
        clienteId: data.clienteId,
      }),

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

/**
 * Revierte la salida de una guía sin eliminar su registro.
 */
export async function anularSalidaGuia(id: number) {
  return prisma.guiaInternamiento.update({
    where: {
      id,
    },

    data: {
      empresaTransporteSalidaId: null,
      vehiculoSalidaId: null,
      conductorSalidaId: null,
      fechaSalida: null,
      horaSalida: null,
      diasAlmacenamiento: null,
      cantidadMovimientos: null,
      subtotalMovimientos: null,
      subtotal: null,
      montoIGV: null,
      montoTotal: null,
      estado: "ALMACENADO",
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
 * Obtiene las guías seleccionadas para validar
 * una asignación masiva de cliente.
 *
 * Solo se recuperan las guías ESPACIO_ALQUILADO.
 */
/**
 * Obtiene las guías de espacio alquilado
 * que todavía no tienen un cliente asignado.
 */
export async function obtenerGuiasEspacioAlquilado() {
  return prisma.guiaInternamiento.findMany({
    where: {
      tipoPrecio: "ESPACIO_ALQUILADO",
      clienteId: null,
    },
    select: {
      id: true,
      numeroGuia: true,
      clienteId: true,
      estado: true,
      contenedor: {
        select: {
          numeroContenedor: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export async function obtenerGuiasEspacioAlquiladoPorIds(guiaIds: number[]) {
  return prisma.guiaInternamiento.findMany({
    where: {
      id: {
        in: guiaIds,
      },
      tipoPrecio: "ESPACIO_ALQUILADO",
    },
    select: {
      id: true,
      clienteId: true,
      tipoPrecio: true,
    },
  })
}

/**
 * Asigna un cliente a múltiples guías
 * de tipo ESPACIO_ALQUILADO.
 */
export async function asignarClienteAGuiasEspacioAlquilado(
  guiaIds: number[],
  clienteId: number
) {
  return prisma.guiaInternamiento.updateMany({
    where: {
      id: {
        in: guiaIds,
      },
      tipoPrecio: "ESPACIO_ALQUILADO",
    },
    data: {
      clienteId,
    },
  })
}

/**
 * Asigna un cliente
 */
export async function asignarClienteAGuia(guiaId: number, clienteId: number) {
  return prisma.guiaInternamiento.update({
    where: {
      id: guiaId,
    },

    data: {
      cliente: {
        connect: {
          id: clienteId,
        },
      },
    },

    select: {
      id: true,
      clienteId: true,
      cliente: {
        select: {
          id: true,
          tipoDocumento: true,
          numeroDocumento: true,
          nombreCompleto: true,
        },
      },
    },
  })
}

/**
 * Crea un cliente y lo asigna a una guía
 * dentro de una única transacción.
 *
 * Si falla la creación o la actualización
 * de la guía, se revierte toda la operación.
 */
export async function crearYAsignarClienteAGuia(
  guiaId: number,
  clienteData: Prisma.ClienteCreateInput
) {
  return prisma.$transaction(async (tx) => {
    const clienteExistente = await findClienteByDocumentoTx(
      tx,
      clienteData.numeroDocumento
    )

    if (clienteExistente) {
      throw new Error("Ya existe un cliente con este número de documento")
    }

    const cliente = await createClienteTx(tx, clienteData)

    const guia = await tx.guiaInternamiento.update({
      where: {
        id: guiaId,
      },

      data: {
        cliente: {
          connect: {
            id: cliente.id,
          },
        },
      },

      select: {
        id: true,
        clienteId: true,
        cliente: {
          select: {
            id: true,
            tipoDocumento: true,
            numeroDocumento: true,
            nombreCompleto: true,
          },
        },
      },
    })

    return {
      cliente,
      guia,
    }
  })
}
