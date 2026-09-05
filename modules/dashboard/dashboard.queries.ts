import "server-only"

// NOTA: ajusta este import a donde tengas tu singleton de PrismaClient.
// Si no lo tienes, créalo en lib/prisma.ts:
//
//   import { PrismaClient } from "@/lib/generated/prisma";
//   const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
//   export const prisma = globalForPrisma.prisma ?? new PrismaClient();
//   if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
//
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

function inicioDelDia(fecha: Date) {
  const d = new Date(fecha)
  d.setHours(0, 0, 0, 0)
  return d
}

function finDelDia(fecha: Date) {
  const d = new Date(fecha)
  d.setHours(23, 59, 59, 999)
  return d
}

function inicioDelMes(fecha: Date) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), 1)
}

function aClaveDia(fecha: Date) {
  return fecha.toISOString().slice(0, 10)
}

// ============================================================
// Tarjetas de estadísticas (KPIs)
// ============================================================
async function getStats(): Promise<DashboardStats> {
  const hoy = new Date()
  const inicioHoy = inicioDelDia(hoy)
  const finHoy = finDelDia(hoy)
  const inicioMes = inicioDelMes(hoy)

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
    // CIF PERU S.A.C. es actualmente el único cliente con este tipo de precio.
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

// ============================================================
// Movimientos diarios (ingresos vs salidas) — últimos N días
// ============================================================
async function getMovimientosDiarios(dias = 14): Promise<MovimientoDiario[]> {
  const hoy = new Date()
  const inicio = inicioDelDia(
    new Date(hoy.getTime() - (dias - 1) * 24 * 60 * 60 * 1000)
  )

  const [ingresos, salidas] = await Promise.all([
    prisma.guiaInternamiento.findMany({
      where: { fechaIngreso: { gte: inicio } },
      select: { fechaIngreso: true },
    }),
    prisma.guiaInternamiento.findMany({
      where: { fechaSalida: { gte: inicio } },
      select: { fechaSalida: true },
    }),
  ])

  const mapa = new Map<string, { ingresos: number; salidas: number }>()
  for (let i = 0; i < dias; i++) {
    const fecha = new Date(inicio.getTime() + i * 24 * 60 * 60 * 1000)
    mapa.set(aClaveDia(fecha), { ingresos: 0, salidas: 0 })
  }

  for (const g of ingresos) {
    const registro = mapa.get(aClaveDia(g.fechaIngreso))
    if (registro) registro.ingresos += 1
  }

  for (const g of salidas) {
    if (!g.fechaSalida) continue
    const registro = mapa.get(aClaveDia(g.fechaSalida))
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
  const hoy = new Date()
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth() - (meses - 1), 1)

  const pagos = await prisma.guiaInternamiento.findMany({
    where: {
      estadoPago: EstadoPago.PAGADO,
      fechaPago: { gte: inicio },
    },
    select: { fechaPago: true, montoTotal: true },
  })

  const mapa = new Map<string, number>()
  for (let i = 0; i < meses; i++) {
    const fecha = new Date(inicio.getFullYear(), inicio.getMonth() + i, 1)
    mapa.set(`${NOMBRES_MES[fecha.getMonth()]} ${fecha.getFullYear()}`, 0)
  }

  for (const p of pagos) {
    if (!p.fechaPago) continue
    const clave = `${NOMBRES_MES[p.fechaPago.getMonth()]} ${p.fechaPago.getFullYear()}`
    mapa.set(clave, (mapa.get(clave) ?? 0) + Number(p.montoTotal ?? 0))
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
      // Solo guías pendientes de pago
      estadoPago: EstadoPago.PENDIENTE,

      // No mostrar guías anuladas
      estado: {
        not: EstadoGuia.ANULADO,
      },

      // Solo guías que ya tienen días de almacenamiento calculados
      diasAlmacenamiento: {
        not: null,
      },

      // Solo guías que tienen monto total calculado
      montoTotal: {
        not: null,
      },
    },

    // Las de mayor monto primero
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
