// modules/liquidaciones/utils/resumen.ts

import type {
  LiquidacionDetalle,
  LiquidacionResumen,
} from "../liquidacion.types"

export function calcularResumen(l: LiquidacionDetalle): LiquidacionResumen {
  let cantidadSalidas = 0
  let totalDiasAdicionales = 0
  let montoPorSubidaBajada = 0
  let montoPorDiasAdicionales = 0

  let sumaPrecioPrimerDia = 0
  let sumaPrecioIngresoSalida = 0
  let cantidadPreciosIngresoSalida = 0
  let sumaPrecioDiaAdicional = 0

  let fechaMin: Date | null = null
  let fechaMax: Date | null = null

  for (const d of l.detalles) {
    cantidadSalidas += 1
    totalDiasAdicionales += d.diasAdicionales

    montoPorSubidaBajada += d.precioPrimerDia
    montoPorDiasAdicionales += d.subtotalDiasAdicionales

    sumaPrecioPrimerDia += d.precioPrimerDia
    sumaPrecioDiaAdicional += d.precioDiaAdicional

    if (d.precioIngresoSalida != null) {
      sumaPrecioIngresoSalida += d.precioIngresoSalida
      cantidadPreciosIngresoSalida += 1
    }

    if (d.fechaSalida) {
      const f = new Date(d.fechaSalida)

      if (!fechaMin || f < fechaMin) fechaMin = f
      if (!fechaMax || f > fechaMax) fechaMax = f
    }
  }

  const precioPromedioPrimerDia =
    cantidadSalidas > 0
      ? sumaPrecioPrimerDia / cantidadSalidas
      : 0

  const precioPromedioSubidaBajada =
    precioPromedioPrimerDia > 0
      ? precioPromedioPrimerDia
      : cantidadPreciosIngresoSalida > 0
        ? sumaPrecioIngresoSalida / cantidadPreciosIngresoSalida
        : 0

  const precioPromedioDiaAdicional =
    cantidadSalidas > 0
      ? sumaPrecioDiaAdicional / cantidadSalidas
      : 0

  return {
    cantidadSalidas,
    totalDiasAdicionales,
    fechaMin,
    fechaMax,
    montoPorSubidaBajada,
    montoPorDiasAdicionales,
    precioPromedioSubidaBajada,
    precioPromedioDiaAdicional,
    subtotal: l.subtotal,
    igv: l.montoIGV,
    total: l.montoTotal,
  }
}