// modules\trasegados\types\pago.types.ts

/**
 * Estado actual de pago de una guía (para el modal).
 */
export interface EstadoPagoGuia {
  guiaTrasegadoId: number
  numeroGuia: string
  numeroCotizacion: string | null
  estadoPago: "PENDIENTE" | "PAGADO"
  metodoPago: string | null
  numeroOperacion: string | null
  fechaPago: Date | null
  totalPagar: number | null
}
