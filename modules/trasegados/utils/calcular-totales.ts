// modules\trasegados\utils\calcular-totales.ts

/**
 * Datos de entrada para el cálculo de totales.
 *
 * - `montoBase` es el monto SIN IGV que ingresa el usuario.
 *   El total con IGV se calcula sumando el porcentaje.
 */
export interface CalcularTotalesInput {
  montoBase: number
  tratamientoIGV: "SIN_IGV" | "CON_IGV"
  porcentajeIGV: number
}

export interface TotalesCalculados {
  subtotal: number
  porcentajeIGV: number
  montoIGV: number
  totalPagar: number
}

/**
 * Redondea a 2 decimales evitando errores de punto flotante.
 *
 * `Math.round(x * 100) / 100` es suficiente para precios
 * de hasta 10^13 sin perder precisión relevante.
 */
function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

/**
 * Calcula subtotal, IGV y total a partir del monto base.
 *
 * Reglas:
 * - Si `tratamientoIGV = "SIN_IGV"`:
 *   - subtotal = montoBase
 *   - montoIGV = 0
 *   - totalPagar = montoBase
 * - Si `tratamientoIGV = "CON_IGV"`:
 *   - subtotal = montoBase
 *   - montoIGV = montoBase * (porcentajeIGV / 100)
 *   - totalPagar = subtotal + montoIGV
 *
 * IMPORTANTE: el "montoBase" siempre es el subtotal sin IGV.
 * El IGV se SUMA al subtotal. No se hace "extracción" del IGV.
 */
export function calcularTotales(
  input: CalcularTotalesInput
): TotalesCalculados {
  const subtotal = round2(input.montoBase)

  if (input.tratamientoIGV === "SIN_IGV") {
    return {
      subtotal,
      porcentajeIGV: 0,
      montoIGV: 0,
      totalPagar: subtotal,
    }
  }

  const porcentaje = input.porcentajeIGV
  const montoIGV = round2(subtotal * (porcentaje / 100))
  const totalPagar = round2(subtotal + montoIGV)

  return {
    subtotal,
    porcentajeIGV: porcentaje,
    montoIGV,
    totalPagar,
  }
}

/**
 * Formatea un número como moneda peruana.
 */
export function formatearSoles(monto: number): string {
  return `S/ ${monto.toFixed(2)}`
}
