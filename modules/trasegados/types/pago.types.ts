// modules\trasegados\types\pago.types.ts

/**
 * Resumen del pago para mostrar en la UI y usar en cálculos.
 */
export interface ResumenPago {
  subtotal: number
  porcentajeIGV: number
  montoIGV: number
  totalPagar: number
  tratamientoIGV: "SIN_IGV" | "CON_IGV"
}

/**
 * Estado actual de pago de una guía (para el modal).
 */
export interface EstadoPagoGuia {
  guiaTrasegadoId: number
  numeroGuia: string
  estadoPago: "PENDIENTE" | "PAGADO"
  metodoPago: string | null
  numeroOperacion: string | null
  fechaPago: Date | null
  subtotal: number | null
  porcentajeIGV: number | null
  montoIGV: number | null
  totalPagar: number | null
  tratamientoIGV: "SIN_IGV" | "CON_IGV"
}
