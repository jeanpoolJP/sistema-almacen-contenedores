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
