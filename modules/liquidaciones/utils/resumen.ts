// modules\liquidaciones\utils\resumen.ts

import type {
  LiquidacionDetalle,
  LiquidacionResumen,
} from "../liquidacion.types"

export function calcularResumen(l: LiquidacionDetalle): LiquidacionResumen {
  let cantidadSalidas = 0
  let cantidadMovimientos = 0
  let montoPorSalidas = 0
  let montoPorMovimientos = 0

  let fechaMin: Date | null = null
  let fechaMax: Date | null = null

  for (const d of l.detalles) {
    cantidadSalidas += 1
    cantidadMovimientos += d.cantidadMovimientos ?? 0
    montoPorSalidas += d.precioIngresoSalida ?? 0
    montoPorMovimientos += d.subtotalMovimientos ?? 0

    if (d.fechaSalida) {
      const f = new Date(d.fechaSalida)
      if (!fechaMin || f < fechaMin) fechaMin = f
      if (!fechaMax || f > fechaMax) fechaMax = f
    }
  }

  // Regla de negocio: si el cliente no cobra "ingreso/salida",
  // se asigna el total de la liquidación a ese concepto.
  if (montoPorSalidas === 0 && l.montoTotal > 0) {
    montoPorSalidas = l.montoTotal
  }

  return {
    cantidadSalidas,
    cantidadMovimientos,
    fechaMin,
    fechaMax,
    montoPorSalidas,
    montoPorMovimientos,
    subtotal: l.subtotal,
    igv: l.montoIGV,
    total: l.montoTotal,
  }
}
