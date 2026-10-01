export type TipoMovimiento = "INGRESO" | "SALIDA"
export type OrigenMovimiento = "INTERNAMIENTO" | "TRASEGADO"

export interface MovimientoItem {
  id: string
  fecha: string
  hora: string
  tipo: TipoMovimiento
  origen: OrigenMovimiento
  guia: string
  elemento: string
  cliente: string
}

export interface ResumenMovimientos {
  total: number
  ingresos: number
  salidas: number
  internamientos: number
  trasegados: number
}

export interface ReporteMovimientos {
  desde: string
  hasta: string
  resumen: ResumenMovimientos
  movimientos: MovimientoItem[]
}

export type MovimientosActionResult =
  | { success: true; data: ReporteMovimientos }
  | { success: false; error: string }
