// modules\dashboard\dashboard.queries.ts

import "server-only"

import { prisma } from "@/lib/prisma"
import { EstadoGuia, EstadoPago, TipoPrecioGuia } from "@/lib/generated/prisma"
import type {
  DashboardData,
  DashboardStats,
  MovimientoDiario,
  IngresoMensual,
  GuiaReciente,
  PagoPendiente,
  DistribucionMedidaContenedor,
} from "./dashboard.types"

import { formatInTimeZone, toZonedTime, fromZonedTime } from "date-fns-tz"

const ZONA_HORARIA = "America/Lima"

const NOMBRES_MES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
]

// ============================================================
// Helpers para cálculo exacto de rangos con Timezone
// ============================================================
function rangoDelDiaEnLima(fecha = new Date()) {
  const ahoraEnLima = toZonedTime(fecha, ZONA_HORARIA)
  const year = ahoraEnLima.getFullYear()
  const month = ahoraEnLima.getMonth()
  const day = ahoraEnLima.getDate()

  // 00:00:00 y 23:59:59.999 en horario de Lima
  const inicioLima = new Date(year, month, day, 0, 0, 0, 0)
  const finLima = new Date(year, month, day, 23, 59, 59, 999)

  // Convertir a objetos UTC equivalentes para consultar a Prisma
  return {
    inicio: fromZonedTime(inicioLima, ZONA_HORARIA),
    fin: fromZonedTime(finLima, ZONA_HORARIA),
  }
}

function inicioDelMesEnLima(fecha = new Date()) {
  const ahoraEnLima = toZonedTime(fecha, ZONA_HORARIA)
  const inicioMesLima = new Date(
    ahoraEnLima.getFullYear(),
    ahoraEnLima.getMonth(),
    1,
    0,
    0,
    0,
    0
  )

  return fromZonedTime(inicioMesLima, ZONA_HORARIA)
}

function aClaveDia(fecha: Date) {
  // Si la fecha fue guardada a medianoche UTC (00:00:00Z),
  // debemos usar UTC para extraer el YYYY-MM-DD correcto y evitar que reste 5 horas.
  if (fecha.getUTCHours() === 0 && fecha.getUTCMinutes() === 0) {
    return fecha.toISOString().split("T")[0]
  }
  return formatInTimeZone(fecha, ZONA_HORARIA, "yyyy-MM-dd")
}

// ============================================================
// Tarjetas de estadísticas (KPIs)
// ============================================================
async function getStats(): Promise<DashboardStats> {
  const { inicio: inicioHoy, fin: finHoy } = rangoDelDiaEnLima()
  const inicioMes = inicioDelMesEnLima()

  const [
    contenedoresAlmacenados,
    contenedoresCifPeru,
    ingresosHoy,
    salidasHoy,
    porCobrar,
    cobradoMes,
    guiasDelMes,
  ] = await Promise.all([
    // Todos los contenedores actualmente almacenados
    prisma.guiaInternamiento.count({
      where: {
        estado: EstadoGuia.ALMACENADO,
      },
    }),

    // Contenedores actualmente almacenados bajo espacio alquilado
    prisma.guiaInternamiento.count({
      where: {
        estado: EstadoGuia.ALMACENADO,
        tipoPrecio: TipoPrecioGuia.ESPACIO_ALQUILADO,
      },
    }),

    prisma.guiaInternamiento.count({
      where: {
        fechaIngreso: {
          gte: inicioHoy,
          lte: finHoy,
        },
      },
    }),

    prisma.guiaInternamiento.count({
      where: {
        fechaSalida: {
          gte: inicioHoy,
          lte: finHoy,
        },
      },
    }),

    prisma.guiaInternamiento.aggregate({
      _sum: {
        montoTotal: true,
      },
      where: {
        estadoPago: EstadoPago.PENDIENTE,
        estado: {
          not: EstadoGuia.ANULADO,
        },
      },
    }),

    prisma.guiaInternamiento.aggregate({
      _sum: {
        montoTotal: true,
      },
      where: {
        estadoPago: EstadoPago.PAGADO,
        fechaPago: {
          gte: inicioMes,
        },
      },
    }),

    prisma.guiaInternamiento.count({
      where: {
        createdAt: {
          gte: inicioMes,
        },
      },
    }),
  ])

  return {
    contenedoresAlmacenados,
    contenedoresCifPeru,
    ingresosHoy,
    salidasHoy,
    montoPorCobrar: Number(porCobrar._sum.montoTotal ?? 0),
    montoCobradoMes: Number(cobradoMes._sum.montoTotal ?? 0),
    guiasDelMes,
  }
}

// ============================================================
// Distribución de contenedores almacenados por medida (20 / 40)
// ============================================================
async function getDistribucionContenedores(): Promise<
  DistribucionMedidaContenedor[]
> {
  const guias = await prisma.guiaInternamiento.findMany({
    where: {
      estado: EstadoGuia.ALMACENADO,
    },
    select: {
      contenedor: {
        select: {
          medida: true,
        },
      },
    },
  })

  const conteo = new Map<number, number>()

  for (const g of guias) {
    const medida = g.contenedor.medida
    conteo.set(medida, (conteo.get(medida) ?? 0) + 1)
  }

  return Array.from(conteo.entries())
    .sort(([medidaA], [medidaB]) => medidaA - medidaB)
    .map(([medida, cantidad]) => ({
      medida,
      cantidad,
    }))
}

async function getMovimientosDiarios(dias = 14): Promise<MovimientoDiario[]> {
  const hoy = new Date()
  const ahoraEnLima = toZonedTime(hoy, ZONA_HORARIA)

  // Rango para la consulta
  const inicioRangoLima = new Date(
    ahoraEnLima.getFullYear(),
    ahoraEnLima.getMonth(),
    ahoraEnLima.getDate() - (dias - 1),
    0,
    0,
    0,
    0
  )
  const inicioUTC = fromZonedTime(inicioRangoLima, ZONA_HORARIA)

  const [ingresos, salidas] = await Promise.all([
    prisma.guiaInternamiento.findMany({
      where: { fechaIngreso: { gte: inicioUTC } },
      select: { fechaIngreso: true },
    }),
    prisma.guiaInternamiento.findMany({
      where: { fechaSalida: { gte: inicioUTC } },
      select: { fechaSalida: true },
    }),
  ])

  const mapa = new Map<string, { ingresos: number; salidas: number }>()

  // Generar las llaves YYYY-MM-DD
  for (let i = 0; i < dias; i++) {
    const d = new Date(inicioRangoLima)
    d.setDate(d.getDate() + i)
    const clave = formatInTimeZone(d, ZONA_HORARIA, "yyyy-MM-dd")
    mapa.set(clave, { ingresos: 0, salidas: 0 })
  }

  // Contar ingresos
  for (const g of ingresos) {
    const clave = aClaveDia(g.fechaIngreso)
    const registro = mapa.get(clave)
    if (registro) registro.ingresos += 1
  }

  // Contar salidas
  for (const g of salidas) {
    if (!g.fechaSalida) continue
    const clave = aClaveDia(g.fechaSalida)
    const registro = mapa.get(clave)
    if (registro) registro.salidas += 1
  }

  return Array.from(mapa.entries()).map(([fecha, valores]) => ({
    fecha,
    ...valores,
  }))
}

// ============================================================
// Ingresos (dinero cobrado) por mes — últimos N meses
// ============================================================
async function getIngresosMensuales(meses = 6): Promise<IngresoMensual[]> {
  const inicioMes = inicioDelMesEnLima()

  // Retroceder N-1 meses
  const inicioRango = toZonedTime(inicioMes, ZONA_HORARIA)
  inicioRango.setMonth(inicioRango.getMonth() - (meses - 1))
  const inicioUTC = fromZonedTime(inicioRango, ZONA_HORARIA)

  const pagos = await prisma.guiaInternamiento.findMany({
    where: {
      estadoPago: EstadoPago.PAGADO,
      fechaPago: { gte: inicioUTC },
    },
    select: { fechaPago: true, montoTotal: true },
  })

  const mapa = new Map<string, number>()
  for (let i = 0; i < meses; i++) {
    const fecha = new Date(inicioRango)
    fecha.setMonth(fecha.getMonth() + i)
    const clave = `${NOMBRES_MES[fecha.getMonth()]} ${fecha.getFullYear()}`
    mapa.set(clave, 0)
  }

  for (const p of pagos) {
    if (!p.fechaPago) continue

    const mes = Number(formatInTimeZone(p.fechaPago, ZONA_HORARIA, "M"))
    const año = Number(formatInTimeZone(p.fechaPago, ZONA_HORARIA, "yyyy"))
    const clave = `${NOMBRES_MES[mes - 1]} ${año}`

    if (mapa.has(clave)) {
      mapa.set(clave, (mapa.get(clave) ?? 0) + Number(p.montoTotal ?? 0))
    }
  }

  return Array.from(mapa.entries()).map(([mes, monto]) => ({ mes, monto }))
}

// ============================================================
// Guías más recientes
// ============================================================
async function getGuiasRecientes(limite = 8): Promise<GuiaReciente[]> {
  const guias = await prisma.guiaInternamiento.findMany({
    take: limite,
    orderBy: { createdAt: "desc" },
    include: {
      cliente: { select: { nombreCompleto: true } },
      contenedor: { select: { numeroContenedor: true, tipo: true } },
    },
  })

  return guias.map((g) => ({
    id: g.id,
    numeroGuia: g.numeroGuia,
    clienteNombre: g.cliente?.nombreCompleto ?? "Sin cliente",
    numeroContenedor: g.contenedor.numeroContenedor,
    tipoContenedor: g.contenedor.tipo,
    estado: g.estado,
    estadoPago: g.estadoPago,
    fechaIngreso: g.fechaIngreso,
    montoTotal: g.montoTotal ? Number(g.montoTotal) : null,
  }))
}

// ============================================================
// Pagos pendientes con mayor monto
// ============================================================
async function getPagosPendientes(limite = 5): Promise<PagoPendiente[]> {
  const guias = await prisma.guiaInternamiento.findMany({
    where: {
      estadoPago: EstadoPago.PENDIENTE,
      estado: {
        not: EstadoGuia.ANULADO,
      },
      diasAlmacenamiento: {
        not: null,
      },
      montoTotal: {
        not: null,
      },
    },
    orderBy: {
      montoTotal: "desc",
    },
    take: limite,
    include: {
      cliente: {
        select: {
          nombreCompleto: true,
        },
      },
    },
  })

  return guias.map((g) => ({
    id: g.id,
    numeroGuia: g.numeroGuia,
    clienteNombre: g.cliente?.nombreCompleto ?? "Sin cliente",
    montoTotal: Number(g.montoTotal),
    diasAlmacenamiento: g.diasAlmacenamiento,
    fechaIngreso: g.fechaIngreso,
  }))
}

// ============================================================
// Punto de entrada único del módulo
// ============================================================
export async function getDashboardData(): Promise<DashboardData> {
  const [
    stats,
    distribucionContenedores,
    movimientosDiarios,
    ingresosMensuales,
    guiasRecientes,
    pagosPendientes,
  ] = await Promise.all([
    getStats(),
    getDistribucionContenedores(),
    getMovimientosDiarios(),
    getIngresosMensuales(),
    getGuiasRecientes(),
    getPagosPendientes(),
  ])

  return {
    stats,
    distribucionContenedores,
    movimientosDiarios,
    ingresosMensuales,
    guiasRecientes,
    pagosPendientes,
  }
}
