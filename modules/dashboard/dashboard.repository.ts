import { prisma } from "@/lib/prisma"

import type { EstadoGuia, EstadoPago } from "@/lib/generated/prisma/client"

/**
 * Obtiene la cantidad total de clientes activos.
 */
export async function countClientes() {
  return prisma.cliente.count({
    where: {
      activo: true,
    },
  })
}

/**
 * Obtiene la cantidad total de guías.
 *
 * Se excluyen las guías anuladas porque normalmente
 * no deberían considerarse operaciones válidas.
 */
export async function countGuias() {
  return prisma.guiaInternamiento.count({
    where: {
      estado: {
        not: "ANULADO" satisfies EstadoGuia,
      },
    },
  })
}

/**
 * Obtiene la cantidad de guías actualmente almacenadas.
 */
export async function countGuiasAlmacenadas() {
  return prisma.guiaInternamiento.count({
    where: {
      estado: "ALMACENADO" satisfies EstadoGuia,
    },
  })
}

/**
 * Obtiene la cantidad de guías retiradas.
 */
export async function countGuiasRetiradas() {
  return prisma.guiaInternamiento.count({
    where: {
      estado: "RETIRADO" satisfies EstadoGuia,
    },
  })
}

/**
 * Obtiene la cantidad de guías anuladas.
 */
export async function countGuiasAnuladas() {
  return prisma.guiaInternamiento.count({
    where: {
      estado: "ANULADO" satisfies EstadoGuia,
    },
  })
}

/**
 * Obtiene la cantidad de guías pendientes de pago.
 *
 * No se consideran las guías anuladas.
 */
export async function countGuiasPendientesPago() {
  return prisma.guiaInternamiento.count({
    where: {
      estadoPago: "PENDIENTE" satisfies EstadoPago,
      estado: {
        not: "ANULADO" satisfies EstadoGuia,
      },
    },
  })
}

/**
 * Obtiene el monto total pendiente de pago.
 */
export async function sumMontoPendiente() {
  return prisma.guiaInternamiento.aggregate({
    _sum: {
      montoTotal: true,
    },
    where: {
      estadoPago: "PENDIENTE" satisfies EstadoPago,
      estado: {
        not: "ANULADO" satisfies EstadoGuia,
      },
    },
  })
}

/**
 * Obtiene el monto total cobrado.
 *
 * Solamente considera guías pagadas.
 */
export async function sumMontoCobrado() {
  return prisma.guiaInternamiento.aggregate({
    _sum: {
      montoTotal: true,
    },
    where: {
      estadoPago: "PAGADO" satisfies EstadoPago,
      estado: {
        not: "ANULADO" satisfies EstadoGuia,
      },
    },
  })
}

/**
 * Obtiene la cantidad de contenedores actualmente
 * almacenados.
 *
 * Se cuentan a partir de las guías cuyo estado actual
 * es ALMACENADO.
 */
export async function countContenedoresAlmacenados() {
  return prisma.guiaInternamiento.count({
    where: {
      estado: "ALMACENADO" satisfies EstadoGuia,
    },
  })
}

/**
 * Obtiene las actividades más recientes.
 *
 * Se utilizan las guías como fuente principal de actividad.
 */
export async function findActividadesRecientes() {
  return prisma.guiaInternamiento.findMany({
    take: 8,

    orderBy: {
      updatedAt: "desc",
    },

    select: {
      id: true,
      numeroGuia: true,
      estado: true,
      fechaIngreso: true,
      fechaSalida: true,
      updatedAt: true,

      cliente: {
        select: {
          nombreCompleto: true,
          numeroDocumento: true,
        },
      },

      contenedor: {
        select: {
          numeroContenedor: true,
          marca: true,
        },
      },
    },
  })
}
