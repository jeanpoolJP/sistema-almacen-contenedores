import {
  countClientes,
  countGuias,
  countGuiasAlmacenadas,
  countGuiasRetiradas,
  countGuiasAnuladas,
  countGuiasPendientesPago,
  countContenedoresAlmacenados,
  sumMontoCobrado,
  sumMontoPendiente,
  findActividadesRecientes,
} from "./dashboard.repository"

import type { ActividadReciente, DashboardData } from "./dashboard.types"

/**
 * Convierte un Decimal de Prisma a number.
 */
function decimalToNumber(value: unknown): number {
  if (value === null || value === undefined) {
    return 0
  }

  return Number(value)
}

/**
 * Obtiene toda la información necesaria
 * para el Dashboard.
 */
export async function obtenerDashboard(): Promise<DashboardData> {
  const [
    clientes,
    guias,
    contenedoresAlmacenados,
    guiasAlmacenadas,
    guiasRetiradas,
    guiasAnuladas,
    guiasPendientesPago,
    montoCobrado,
    montoPendiente,
    actividades,
  ] = await Promise.all([
    countClientes(),
    countGuias(),
    countContenedoresAlmacenados(),
    countGuiasAlmacenadas(),
    countGuiasRetiradas(),
    countGuiasAnuladas(),
    countGuiasPendientesPago(),
    sumMontoCobrado(),
    sumMontoPendiente(),
    findActividadesRecientes(),
  ])

  const actividadesFormateadas: ActividadReciente[] = actividades.map(
    (actividad) => {
      const esSalida = actividad.fechaSalida !== null

      return {
        id: actividad.id,

        numeroGuia: actividad.numeroGuia,

        tipo: esSalida ? "SALIDA" : "INGRESO",

        fecha: (
          actividad.fechaSalida ??
          actividad.fechaIngreso ??
          actividad.createdAt
        ).toISOString(),

        estado: actividad.estado,

        cliente:
          actividad.cliente?.nombreCompleto ??
          actividad.cliente?.numeroDocumento ??
          "Sin cliente",

        numeroContenedor: actividad.contenedor.numeroContenedor,

        marcaContenedor: actividad.contenedor.marca,
      }
    }
  )

  return {
    statistics: {
      clientes,
      guias,
      contenedoresAlmacenados,
      totalCobrado: decimalToNumber(montoCobrado._sum.montoTotal),

      guiasAlmacenadas,
      guiasRetiradas,
      guiasPendientesPago,

      montoPendiente: decimalToNumber(montoPendiente._sum.montoTotal),
    },

    actividades: actividadesFormateadas,

    estadoAlmacen: {
      almacenados: guiasAlmacenadas,

      retirados: guiasRetiradas,

      anulados: guiasAnuladas,

      total: guiasAlmacenadas + guiasRetiradas + guiasAnuladas,
    },
  }
}
