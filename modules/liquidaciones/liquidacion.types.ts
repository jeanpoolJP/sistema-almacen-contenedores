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
  horaIngreso: string | null
  fechaSalida: Date | null
  horaSalida: string | null
  diasAlmacenamiento: number | null
  precioPrimerDia: number
  precioIngresoSalida: number | null // NUEVO
  precioDiaAdicional: number
  diasAdicionales: number
  subtotalDiasAdicionales: number
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
  diasAlmacenamiento: number | null
  precioIngresoSalida: number | null
  cantidadMovimientos: number | null
  subtotalMovimientos: number | null
  montoTotal: number
}

export type LiquidacionResumen = {
  cantidadSalidas: number
  totalDiasAdicionales: number
  fechaMin: Date | null
  fechaMax: Date | null
  montoPorSubidaBajada: number
  montoPorDiasAdicionales: number
  precioPromedioSubidaBajada: number // promedio de precioPrimerDia de todas las guías
  precioPromedioDiaAdicional: number // promedio de precioDiaAdicional de todas las guías
  subtotal: number
  igv: number
  total: number
}
