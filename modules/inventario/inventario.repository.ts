// modules/inventario/inventario.repository.ts

import { prisma } from "@/lib/prisma"
import {
  EstadoInventario,
  ResultadoInventario,
} from "@/lib/generated/prisma/client"

/**
 * Obtiene los inventarios registrados con paginacion.
 */
export async function obtenerInventarios(page: number, limit: number) {
  const skip = (page - 1) * limit

  const [inventarios, total] = await prisma.$transaction([
    prisma.inventario.findMany({
      skip,
      take: limit,
      orderBy: {
        fecha: "desc",
      },
      include: {
        _count: {
          select: {
            detalles: true,
          },
        },
      },
    }),

    prisma.inventario.count(),
  ])

  return {
    inventarios,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Obtiene un inventario por ID junto con sus detalles
 * y la información necesaria de la guía/contenedor.
 */
export async function obtenerInventarioPorId(id: number) {
  return prisma.inventario.findUnique({
    where: {
      id,
    },
    include: {
      detalles: {
        include: {
          guia: {
            select: {
              id: true,
              numeroGuia: true,
              fechaIngreso: true,
              estado: true,
              contenedor: {
                select: {
                  id: true,
                  numeroContenedor: true,
                  medida: true,
                  tipo: true,
                  marca: true,
                },
              },
            },
          },
        },
        orderBy: {
          guia: {
            contenedor: {
              medida: "asc",
            },
          },
        },
      },
    },
  })
}

/**
 * Obtiene las guías que actualmente figuran como almacenadas.
 *
 * Estas son las guías que pueden formar parte de un nuevo inventario.
 */
export async function obtenerGuiasAlmacenadas() {
  return prisma.guiaInternamiento.findMany({
    where: {
      estado: "ALMACENADO",
    },
    select: {
      id: true,
      numeroGuia: true,
      fechaIngreso: true,
      contenedor: {
        select: {
          id: true,
          numeroContenedor: true,
          medida: true,
          tipo: true,
          marca: true,
        },
      },
    },
    orderBy: [
      {
        contenedor: {
          medida: "asc",
        },
      },
      {
        fechaIngreso: "asc",
      },
    ],
  })
}

/**
 * Crea un inventario junto con sus detalles.
 *
 * Recibe las guías que fueron seleccionadas como "fotografía"
 * del almacén en el momento de generar el inventario.
 */
export async function crearInventario(
  fecha: Date,
  guiaIds: number[],
  observaciones?: string
) {
  return prisma.$transaction(async (tx) => {
    const inventario = await tx.inventario.create({
      data: {
        fecha,
        observaciones,
        detalles: {
          create: guiaIds.map((guiaId) => ({
            guiaId,
            resultado: ResultadoInventario.PENDIENTE,
          })),
        },
      },
      include: {
        detalles: true,
      },
    })

    return inventario
  })
}

/**
 * Actualiza el resultado de la verificación física
 * de un detalle de inventario.
 */
export async function actualizarResultadoDetalle(
  detalleId: number,
  resultado: ResultadoInventario,
  observaciones?: string
) {
  return prisma.inventarioDetalle.update({
    where: {
      id: detalleId,
    },
    data: {
      resultado,
      observaciones,
      verificadoAt:
        resultado === ResultadoInventario.PENDIENTE ? null : new Date(),
    },
  })
}

/**
 * Finaliza un inventario.
 */
export async function finalizarInventario(id: number) {
  return prisma.inventario.update({
    where: {
      id,
    },
    data: {
      estado: EstadoInventario.FINALIZADO,
    },
  })
}

/**
 * Obtiene un inventario junto con sus estadísticas.
 */
export async function obtenerEstadisticasInventario(id: number) {
  const [total, pendientes, encontrados, noEncontrados] = await Promise.all([
    prisma.inventarioDetalle.count({
      where: {
        inventarioId: id,
      },
    }),

    prisma.inventarioDetalle.count({
      where: {
        inventarioId: id,
        resultado: ResultadoInventario.PENDIENTE,
      },
    }),

    prisma.inventarioDetalle.count({
      where: {
        inventarioId: id,
        resultado: ResultadoInventario.ENCONTRADO,
      },
    }),

    prisma.inventarioDetalle.count({
      where: {
        inventarioId: id,
        resultado: ResultadoInventario.NO_ENCONTRADO,
      },
    }),
  ])

  return {
    total,
    pendientes,
    encontrados,
    noEncontrados,
  }
}
