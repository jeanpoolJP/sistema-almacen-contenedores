export const PERIODOS_ESTADISTICAS_TRASEGADO = [
  "HISTORIAL",
  "HOY",
  "SEMANA",
  "MES",
  "MES_PASADO",
  "ANIO",
  "RANGO",
] as const

export type PeriodoEstadisticasTrasegado =
  (typeof PERIODOS_ESTADISTICAS_TRASEGADO)[number]

export interface IngresoMensualTrasegado {
  mes: string
  anio: number
  generado: number
  cobrado: number
}

export interface EstadisticasTrasegado {
  periodo: PeriodoEstadisticasTrasegado
  guiasTotales: number
  guiasFinalizadas: number
  guiasEnProceso: number
  totalGenerado: number
  totalCobrado: number
  totalPendiente: number
  ingresosMensuales: IngresoMensualTrasegado[]
}

export interface FiltroEstadisticasTrasegado {
  periodo: PeriodoEstadisticasTrasegado
  fechaDesde?: string
  fechaHasta?: string
}
