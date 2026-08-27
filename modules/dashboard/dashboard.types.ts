/**
 * Tipos utilizados por el módulo Dashboard.
 */

export type DashboardStatistics = {
  clientes: number
  guias: number
  contenedoresAlmacenados: number
  totalCobrado: number

  guiasAlmacenadas: number
  guiasRetiradas: number
  guiasPendientesPago: number
  montoPendiente: number
}

export type ActividadReciente = {
  id: number
  numeroGuia: string
  tipo: "INGRESO" | "SALIDA"

  fecha: string
  estado: string

  cliente: string
  numeroContenedor: string
  marcaContenedor: string
}

export type EstadoAlmacen = {
  almacenados: number
  retirados: number
  anulados: number
  total: number
}

export type DashboardData = {
  statistics: DashboardStatistics
  actividades: ActividadReciente[]
  estadoAlmacen: EstadoAlmacen
}
