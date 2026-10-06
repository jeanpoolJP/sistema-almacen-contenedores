import "server-only"

import type { Prisma } from "@/lib/generated/prisma"
import { prisma } from "@/lib/prisma"

interface FiltroFecha {
  desde?: Date
  hasta?: Date
}

interface IngresoMensualQuery {
  anio: number
  mes: number
  generado: number
  cobrado: number
}

export async function obtenerEstadisticasGuiasRepository(
  filtro: FiltroFecha & { inicioGrafica: Date; finGrafica: Date }
) {
  const where: Prisma.GuiaInternamientoWhereInput = {
    estado: { not: "ANULADO" },
    fechaSalida: {
      not: null,
      ...(filtro.desde ? { gte: filtro.desde } : {}),
      ...(filtro.hasta ? { lt: filtro.hasta } : {}),
    },
  }

  const [resumen, estados, pagos, ingresosMensuales, guiasAlmacenadas] =
    await Promise.all([
      prisma.guiaInternamiento.aggregate({
        where,
        _count: { _all: true },
        _sum: { montoTotal: true },
      }),
      prisma.guiaInternamiento.groupBy({
        by: ["estado"],
        where,
        _count: { _all: true },
      }),
      prisma.guiaInternamiento.groupBy({
        by: ["estadoPago"],
        where,
        _sum: { montoTotal: true },
      }),
      prisma.$queryRaw<IngresoMensualQuery[]>`
      SELECT
        EXTRACT(YEAR FROM "fecha_salida")::INTEGER AS anio,
        EXTRACT(MONTH FROM "fecha_salida")::INTEGER AS mes,
        COALESCE(SUM("monto_total"), 0)::DOUBLE PRECISION AS generado,
        COALESCE(
          SUM("monto_total") FILTER (WHERE "estado_pago" = 'PAGADO'),
          0
        )::DOUBLE PRECISION AS cobrado
      FROM "guias_internamiento"
      WHERE "estado" <> 'ANULADO'
        AND "fecha_salida" IS NOT NULL
        AND "fecha_salida" >= ${filtro.inicioGrafica}
        AND "fecha_salida" < ${filtro.finGrafica}
      GROUP BY anio, mes
      ORDER BY anio, mes
      `,
      // El inventario actual no depende del periodo de salidas seleccionado.
      prisma.guiaInternamiento.count({
        where: { estado: "ALMACENADO" },
      }),
    ])

  const guiasTotales = await prisma.guiaInternamiento.count({
    where: { estado: { not: "ANULADO" } },
  })

  return {
    guiasTotales,
    totalGenerado: Number(resumen._sum.montoTotal ?? 0),
    guiasAlmacenadas,
    guiasRetiradas:
      estados.find((item) => item.estado === "RETIRADO")?._count._all ?? 0,
    totalCobrado: Number(
      pagos.find((item) => item.estadoPago === "PAGADO")?._sum.montoTotal ?? 0
    ),
    totalPendiente: Number(
      pagos.find((item) => item.estadoPago === "PENDIENTE")?._sum.montoTotal ??
        0
    ),
    ingresosMensuales,
  }
}
