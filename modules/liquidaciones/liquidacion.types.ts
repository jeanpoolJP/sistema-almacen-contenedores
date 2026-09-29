// modules\liquidaciones\liquidacion.types.ts

import type {
  EstadoLiquidacion,
  MetodoPago,
  TipoContenedor,
} from "@/lib/generated/prisma"

export type LiquidacionDetalleItem = {
  id: number
  guiaId: number
  numeroGuia: string
  marcaContenedor: string
  numeroContenedor: string
  medidaContenedor: number
  tipoContenedor: TipoContenedor
  fechaIngreso: Date
  fechaSalida: Date | null
  precioIngresoSalida: number | null
  cantidadMovimientos: number | null
  subtotalMovimientos: number | null
  montoTotalGuia: number
}

export type LiquidacionListItem = {
  id: number
  numero: string
  clienteId: number
  clienteNombre: string
  clienteDocumento: string
  fechaCorte: Date
  estado: EstadoLiquidacion
  cantidadGuias: number
  montoTotal: number
  createdAt: Date
}

export type LiquidacionDetalle = LiquidacionListItem & {
  subtotal: number
  porcentajeIGV: number
  montoIGV: number
  metodoPago: MetodoPago | null
  numeroOperacion: string | null
  fechaPago: Date | null
  observaciones: string | null
  confirmadaAt: Date | null
  detalles: LiquidacionDetalleItem[]
}

export type GuiaDisponible = {
  id: number
  numeroGuia: string
  marcaContenedor: string
  numeroContenedor: string
  medidaContenedor: number
  tipoContenedor: TipoContenedor
  fechaIngreso: Date
  fechaSalida: Date | null
  precioIngresoSalida: number | null
  cantidadMovimientos: number | null
  subtotalMovimientos: number | null
  montoTotal: number
}

export type LiquidacionResumen = {
  cantidadSalidas: number
  cantidadMovimientos: number
  fechaMin: Date | null
  fechaMax: Date | null
  montoPorSalidas: number // Σ (precioIngresoSalida) — 1 por guía
  montoPorMovimientos: number // Σ (subtotalMovimientos)
  subtotal: number // montoPorSalidas + montoPorMovimientos (o el subtotal real)
  igv: number
  total: number
}
