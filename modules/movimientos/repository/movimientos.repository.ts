// modules\movimientos\repository\movimientos.repository.ts

import { prisma } from "@/lib/prisma"

interface RangoFechas {
  desdeFecha?: Date
  hastaFechaExclusiva?: Date
  desdeInstante?: Date
  hastaInstanteExclusivo?: Date
}

export const movimientosRepository = {
  // Obtiene los internamientos dentro del rango de fechas especificado
  obtenerInternamientos(rango: RangoFechas) {
    const filtroFecha = {
      ...(rango.desdeFecha ? { gte: rango.desdeFecha } : {}),
      ...(rango.hastaFechaExclusiva ? { lt: rango.hastaFechaExclusiva } : {}),
    }
    const tieneFiltroFecha =
      rango.desdeFecha !== undefined || rango.hastaFechaExclusiva !== undefined

    return prisma.guiaInternamiento.findMany({
      ...(tieneFiltroFecha
        ? {
            where: {
              OR: [{ fechaIngreso: filtroFecha }, { fechaSalida: filtroFecha }],
            },
          }
        : {}),
      select: {
        id: true,
        numeroGuia: true,
        fechaIngreso: true,
        horaIngreso: true,
        fechaSalida: true,
        horaSalida: true,
        contenedor: {
          select: {
            marca: true,
            numeroContenedor: true,
            medida: true,
          },
        },
        cliente: { select: { nombreCompleto: true } },
      },
    })
  },

  // Obtiene los ingresos de guías trasegadas dentro del rango de fechas especificado
  obtenerIngresosTrasegado(rango: RangoFechas) {
    return prisma.guiaTrasegadoIngreso.findMany({
      where: {
        guiaTrasegado: {
          fechaIngreso: {
            ...(rango.desdeInstante ? { gte: rango.desdeInstante } : {}),
            ...(rango.hastaInstanteExclusivo
              ? { lt: rango.hastaInstanteExclusivo }
              : {}),
          },
        },
      },
      select: {
        id: true,
        guiaTrasegado: {
          select: {
            numeroGuia: true,
            fechaIngreso: true,
            cliente: { select: { nombreCompleto: true } },
          },
        },
        elementos: {
          select: {
            id: true,
            tipo: true,
            numero: true,
            descripcion: true,
            contenedor: {
              select: { marca: true, numeroContenedor: true, medida: true },
            },
            flatRack: { select: { marca: true, numero: true } },
          },
        },
      },
    })
  },

  // Obtiene las salidas de guías trasegadas dentro del rango de fechas especificado
  obtenerSalidasTrasegado(rango: RangoFechas) {
    return prisma.guiaTrasegadoSalida.findMany({
      where: {
        fechaSalida: {
          ...(rango.desdeInstante ? { gte: rango.desdeInstante } : {}),
          ...(rango.hastaInstanteExclusivo
            ? { lt: rango.hastaInstanteExclusivo }
            : {}),
        },
      },
      select: {
        id: true,
        fechaSalida: true,
        guiaTrasegado: {
          select: {
            numeroGuia: true,
            cliente: { select: { nombreCompleto: true } },
          },
        },
        elementos: {
          select: {
            elemento: {
              select: {
                id: true,
                tipo: true,
                numero: true,
                descripcion: true,
                contenedor: {
                  select: {
                    marca: true,
                    numeroContenedor: true,
                    medida: true,
                  },
                },
                flatRack: { select: { marca: true, numero: true } },
              },
            },
          },
        },
      },
    })
  },
}
