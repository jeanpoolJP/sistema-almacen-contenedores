// modules\trasegados\utils\calcular-cotizacion.ts

import type { ModoIGVCotizacionValue } from "../schemas/cotizacion.schema"

export const PORCENTAJE_IGV_COTIZACION = 18

export interface TotalesCotizacion {
  subtotal: number
  porcentajeIGV: number
  montoIGV: number
  totalPagar: number
}

function redondearDosDecimales(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100
}

export function calcularTotalesCotizacion(
  montoIngresado: number,
  modo: ModoIGVCotizacionValue
): TotalesCotizacion {
  const monto =
    Number.isFinite(montoIngresado) && montoIngresado > 0
      ? redondearDosDecimales(montoIngresado)
      : 0

  if (modo === "SIN_IGV") {
    return {
      subtotal: monto,
      porcentajeIGV: 0,
      montoIGV: 0,
      totalPagar: monto,
    }
  }

  if (modo === "CON_IGV") {
    const subtotal = monto
    const montoIGV = redondearDosDecimales(
      subtotal * (PORCENTAJE_IGV_COTIZACION / 100)
    )

    return {
      subtotal,
      porcentajeIGV: PORCENTAJE_IGV_COTIZACION,
      montoIGV,
      totalPagar: redondearDosDecimales(subtotal + montoIGV),
    }
  }

  const totalPagar = monto
  const subtotal = redondearDosDecimales(
    totalPagar / (1 + PORCENTAJE_IGV_COTIZACION / 100)
  )

  return {
    subtotal,
    porcentajeIGV: PORCENTAJE_IGV_COTIZACION,
    montoIGV: redondearDosDecimales(totalPagar - subtotal),
    totalPagar,
  }
}
