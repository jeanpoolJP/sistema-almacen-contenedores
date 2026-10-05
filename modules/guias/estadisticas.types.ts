export const PERIODOS_ESTADISTICAS_GUIAS = [
  "HISTORIAL",
  "HOY",
  "SEMANA",
  "MES",
  "MES_PASADO",
  "ANIO",
  "RANGO",
] as const

export type PeriodoEstadisticasGuias =
  (typeof PERIODOS_ESTADISTICAS_GUIAS)[number]

export interface IngresoMensualGuias {
  mes: string
  generado: number
  cobrado: number
}

export interface EstadisticasGuias {
  periodo: PeriodoEstadisticasGuias
  guiasTotales: number
  guiasAlmacenadas: number
  guiasRetiradas: number
  totalGenerado: number
  totalCobrado: number
  totalPendiente: number
  ingresosMensuales: IngresoMensualGuias[]
}

export interface FiltroEstadisticasGuias {
  periodo: PeriodoEstadisticasGuias
  fechaDesde?: string
  fechaHasta?: string
}
