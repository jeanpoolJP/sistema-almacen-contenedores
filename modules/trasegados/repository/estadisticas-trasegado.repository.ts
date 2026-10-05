import "server-only"

import type { Prisma } from "@/lib/generated/prisma"
import { prisma } from "@/lib/prisma"

interface RangoEstadisticas {
  desde?: Date
  hasta?: Date
  hastaExclusivo?: boolean
  inicioGrafica: Date
  finGrafica: Date
}

interface IngresoMensualQuery {
  anio: number
  mes: number
  generado: number
  cobrado: number
}

export async function obtenerEstadisticasTrasegadoRepository(
  rango: RangoEstadisticas
) {
  const where: Prisma.GuiaTrasegadoWhereInput = {
    ...(rango.desde || rango.hasta
      ? {
          fechaIngreso: {
            ...(rango.desde ? { gte: rango.desde } : {}),
            ...(rango.hasta
              ? rango.hastaExclusivo
                ? { lt: rango.hasta }
                : { lte: rango.hasta }
              : {}),
          },
        }
      : {}),
  }

  const [resumen, estados, pagos, ingresosMensuales] = await Promise.all([
    prisma.guiaTrasegado.aggregate({
      where,
      _count: { _all: true },
      _sum: { totalPagar: true },
    }),
    prisma.guiaTrasegado.groupBy({
      by: ["estado"],
      where,
      _count: { _all: true },
    }),
    prisma.guiaTrasegado.groupBy({
      by: ["estadoPago"],
      where,
      _sum: { totalPagar: true },
    }),
    prisma.$queryRaw<IngresoMensualQuery[]>`
      SELECT
        EXTRACT(YEAR FROM ("fecha_ingreso" AT TIME ZONE 'America/Lima'))::INTEGER AS anio,
        EXTRACT(MONTH FROM ("fecha_ingreso" AT TIME ZONE 'America/Lima'))::INTEGER AS mes,
        COALESCE(SUM("total_pagar"), 0)::DOUBLE PRECISION AS generado,
        COALESCE(
          SUM("total_pagar") FILTER (WHERE "estado_pago" = 'PAGADO'),
          0
        )::DOUBLE PRECISION AS cobrado
      FROM "guias_trasegado"
        WHERE "fecha_ingreso" >= ${rango.inicioGrafica}
          AND "fecha_ingreso" < ${rango.finGrafica}
      GROUP BY anio, mes
      ORDER BY anio, mes
      `,
  ])

  return {
    guiasTotales: resumen._count._all,
    totalGenerado: Number(resumen._sum.totalPagar ?? 0),
    guiasFinalizadas:
      estados.find((item) => item.estado === "FINALIZADO")?._count._all ?? 0,
    guiasEnProceso:
      estados.find((item) => item.estado === "EN_PROCESO")?._count._all ?? 0,
    totalCobrado: Number(
      pagos.find((item) => item.estadoPago === "PAGADO")?._sum.totalPagar ?? 0
    ),
    totalPendiente: Number(
      pagos.find((item) => item.estadoPago === "PENDIENTE")?._sum.totalPagar ??
        0
    ),
    ingresosMensuales,
  }
}
