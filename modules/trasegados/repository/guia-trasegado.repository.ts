// modules\trasegados\repository\guia-trasegado.repository.ts

import { prisma } from "@/lib/prisma"

import type { TipoElementoTrasegado } from "@/lib/generated/prisma/client"

export type CrearGuiaTrasegadoRepositoryInput = {
  numeroGuia: string
  descripcionServicio?: string
  clienteId?: number | null
  fechaIngreso: Date
  observaciones?: string

  ingreso: {
    empresaTransporteId: number
    vehiculoId: number
    conductorId: number

    elementos: Array<{
      tipo: TipoElementoTrasegado

      contenedorId?: number
      flatRackId?: number

      numero: string
      descripcion?: string
      observaciones?: string
    }>
  }
}

/**
 * Crea una guía de trasegado junto con:
 *
 * - La información principal de la guía.
 * - El ingreso asociado.
 * - Todos los elementos ingresados.
 *
 * La operación se realiza dentro de una única operación
 * de Prisma para mantener la integridad de los datos.
 */
export async function createGuiaTrasegado(
  data: CrearGuiaTrasegadoRepositoryInput
) {
  return prisma.guiaTrasegado.create({
    data: {
      numeroGuia: data.numeroGuia,
      descripcionServicio: data.descripcionServicio || null,
      clienteId: data.clienteId ?? null,
      fechaIngreso: data.fechaIngreso,
      observaciones: data.observaciones || null,

      ingreso: {
        create: {
          empresaTransporteId: data.ingreso.empresaTransporteId,
          vehiculoId: data.ingreso.vehiculoId,
          conductorId: data.ingreso.conductorId,

          elementos: {
            create: data.ingreso.elementos.map((elemento) => ({
              tipo: elemento.tipo,

              contenedorId: elemento.contenedorId ?? null,
              flatRackId: elemento.flatRackId ?? null,

              numero: elemento.numero,
              descripcion: elemento.descripcion || null,
              observaciones: elemento.observaciones || null,
            })),
          },
        },
      },
    },

    include: {
      cliente: true,

      ingreso: {
        include: {
          empresaTransporte: true,
          vehiculo: true,
          conductor: true,

          elementos: {
            include: {
              contenedor: true,
              flatRack: true,
            },
          },
        },
      },

      salidas: {
        include: {
          empresaTransporte: true,
          vehiculo: true,
          conductor: true,

          elementos: {
            include: {
              elemento: {
                include: {
                  contenedor: true,
                  flatRack: true,
                },
              },
            },
          },
        },
      },
    },
  })
}

/**
 * Busca una guía de trasegado por su ID.
 *
 * Incluye:
 * - Cliente
 * - Ingreso
 * - Empresa de transporte
 * - Vehículo
 * - Conductor
 * - Elementos ingresados
 * - Contenedor / Flat Rack relacionado
 * - Salidas
 * - Elementos retirados en cada salida
 */
export async function findGuiaTrasegadoById(id: number) {
  return prisma.guiaTrasegado.findUnique({
    where: {
      id,
    },

    include: {
      cliente: true,

      ingreso: {
        include: {
          empresaTransporte: true,
          vehiculo: true,
          conductor: true,

          elementos: {
            include: {
              contenedor: true,
              flatRack: true,

              salidas: {
                include: {
                  salida: {
                    include: {
                      empresaTransporte: true,
                      vehiculo: true,
                      conductor: true,
                    },
                  },
                },
              },
            },
          },
        },
      },

      salidas: {
        include: {
          empresaTransporte: true,
          vehiculo: true,
          conductor: true,

          elementos: {
            include: {
              elemento: {
                include: {
                  contenedor: true,
                  flatRack: true,
                },
              },
            },
          },
        },
      },
    },
  })
}

/**
 * Busca una guía por su número.
 */
export async function findGuiaTrasegadoByNumero(numeroGuia: string) {
  return prisma.guiaTrasegado.findUnique({
    where: {
      numeroGuia,
    },

    include: {
      cliente: true,

      ingreso: {
        include: {
          empresaTransporte: true,
          vehiculo: true,
          conductor: true,

          elementos: {
            include: {
              contenedor: true,
              flatRack: true,
            },
          },
        },
      },

      salidas: {
        include: {
          empresaTransporte: true,
          vehiculo: true,
          conductor: true,

          elementos: {
            include: {
              elemento: {
                include: {
                  contenedor: true,
                  flatRack: true,
                },
              },
            },
          },
        },
      },
    },
  })
}

import type { Prisma } from "@/lib/generated/prisma"

// import { prisma } from "@/lib/prisma"
import { createDateRangeLima, type DateRange } from "@/lib/date/range"

import type { ListarGuiasTrasegadoInput } from "../schemas/listar-guias-trasegado.schema"

/**
 * Construye el `where` de Prisma a partir de los filtros
 * del listado, resolviendo los rangos de fecha en horario Lima.
 */
function construirWhere(
  filtros: ListarGuiasTrasegadoInput
): Prisma.GuiaTrasegadoWhereInput {
  const where: Prisma.GuiaTrasegadoWhereInput = {}

  // ------------------ BÚSQUEDA TEXTUAL ------------------
  if (filtros.numeroGuia) {
    where.numeroGuia = {
      contains: filtros.numeroGuia.toUpperCase(),
      mode: "insensitive",
    }
  }

  // ------------------ CLIENTE POR DOCUMENTO ------------------
  if (filtros.numeroDocumentoCliente) {
    where.cliente = {
      numeroDocumento: {
        contains: filtros.numeroDocumentoCliente,
      },
    }
  }

  // ------------------ ELEMENTO POR NÚMERO DE CONTENEDOR ------------------
  if (filtros.numeroContenedor) {
    where.ingreso = {
      elementos: {
        some: {
          contenedor: {
            numeroContenedor: {
              contains: filtros.numeroContenedor.toUpperCase(),
              mode: "insensitive",
            },
          },
        },
      },
    }
  }

  // ------------------ ESTADOS ------------------
  if (filtros.estado) {
    where.estado = filtros.estado
  }

  if (filtros.estadoPago) {
    where.estadoPago = filtros.estadoPago
  }

  // ------------------ RANGO FECHA INGRESO ------------------
  // La UI envía "YYYY-MM-DD" en horario Lima.
  // Convertimos a un rango UTC [from, to).
  const rangoIngreso = construirRangoFechas(
    filtros.fechaIngresoDesde,
    filtros.fechaIngresoHasta
  )
  if (rangoIngreso) {
    where.fechaIngreso = {
      gte: rangoIngreso.from,
      lt: rangoIngreso.to,
    }
  }

  // ------------------ RANGO FECHA SALIDA ------------------
  // Como fechaSalida vive en GuiaTrasegadoSalida (varias por guía),
  // filtramos por "al menos una salida dentro del rango".
  const rangoSalida = construirRangoFechas(
    filtros.fechaSalidaDesde,
    filtros.fechaSalidaHasta
  )
  if (rangoSalida) {
    where.salidas = {
      some: {
        fechaSalida: {
          gte: rangoSalida.from,
          lt: rangoSalida.to,
        },
      },
    }
  }

  return where
}

/**
 * Combina dos fechas "YYYY-MM-DD" en un rango UTC [from, to).
 *
 * - Si solo viene `desde`: [desde 00:00 Lima, +∞) → to = desde + 1 día.
 * - Si solo viene `hasta`: (-∞, hasta 00:00 Lima + 1 día).
 * - Si vienen ambas: [desde 00:00 Lima, hasta 00:00 Lima + 1 día).
 */
function construirRangoFechas(
  desde?: string,
  hasta?: string
): DateRange | null {
  if (!desde && !hasta) return null

  if (desde && !hasta) {
    const r = createDateRangeLima(desde)
    return r
  }

  if (!desde && hasta) {
    return createDateRangeLima(hasta)
  }

  const rDesde = createDateRangeLima(desde!)
  const rHasta = createDateRangeLima(hasta!)

  return { from: rDesde.from, to: rHasta.to }
}

/**
 * Lista las guías de trasegado aplicando filtros y paginación.
 *
 * Devuelve solo los campos necesarios para la tabla.
 */
export async function listarGuiasTrasegadoRepository(
  filtros: ListarGuiasTrasegadoInput
) {
  const where = construirWhere(filtros)

  const skip = (filtros.page - 1) * filtros.pageSize
  const take = filtros.pageSize

  const orderBy: Prisma.GuiaTrasegadoOrderByWithRelationInput = {
    [filtros.ordenarPor]: filtros.orden,
  }

  const [items, total] = await Promise.all([
    prisma.guiaTrasegado.findMany({
      where,
      skip,
      take,
      orderBy,
      select: {
        id: true,
        numeroGuia: true,
        descripcionServicio: true,
        fechaIngreso: true,
        estado: true,
        estadoPago: true,
        totalPagar: true,
        cliente: {
          select: {
            id: true,
            tipoDocumento: true,
            numeroDocumento: true,
            nombreCompleto: true,
          },
        },
        // Para los contadores usamos _count
        _count: {
          select: {
            salidas: true,
          },
        },
        ingreso: {
          select: {
            _count: {
              select: {
                elementos: true,
              },
            },
          },
        },
      },
    }),
    prisma.guiaTrasegado.count({ where }),
  ])

  return { items, total }
}

/**
 * Obtiene el detalle completo de una guía por su ID.
 * Devuelve `null` si no existe.
 */
export async function obtenerGuiaTrasegadoPorIdRepository(id: number) {
  return prisma.guiaTrasegado.findUnique({
    where: { id },
    include: {
      cliente: true,
      ingreso: {
        include: {
          empresaTransporte: true,
          vehiculo: true,
          conductor: true,
          elementos: {
            include: {
              contenedor: true,
              flatRack: true,
              salidas: {
                select: { id: true, salidaId: true },
              },
            },
          },
        },
      },
      salidas: {
        orderBy: { fechaSalida: "asc" },
        include: {
          empresaTransporte: true,
          vehiculo: true,
          conductor: true,
          elementos: {
            include: {
              elemento: {
                select: {
                  id: true,
                  tipo: true,
                  numero: true,
                  descripcion: true,
                },
              },
            },
          },
        },
      },
    },
  })
}
