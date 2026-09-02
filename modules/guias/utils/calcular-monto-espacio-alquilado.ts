// modules\guias\utils\calcular-monto-espacio-alquilado.ts

import type { TratamientoIGV } from "@/lib/generated/prisma"

import type { CalculoMonto } from "../guia.types"

type DatosCalculoEspacioAlquilado = {
  precioIngresoSalida: number
  cantidadMovimientos: number
  precioMovimiento: number

  tratamientoIGV: TratamientoIGV
  porcentajeIGV: number
}

/**
 * Calcula el monto de una guía cuyo precio
 * corresponde a un espacio alquilado.
 *
 * Fórmula:
 *
 * precio ingreso/salida
 * +
 * (cantidad movimientos × precio movimiento)
 */
export function calcularMontoEspacioAlquilado({
  precioIngresoSalida,
  cantidadMovimientos,
  precioMovimiento,
  tratamientoIGV,
  porcentajeIGV,
}: DatosCalculoEspacioAlquilado): CalculoMonto {
  // ============================================================
  // 1. VALIDACIONES
  // ============================================================

  if (!Number.isFinite(precioIngresoSalida) || precioIngresoSalida < 0) {
    throw new Error("El precio de ingreso y salida no es válido")
  }

  if (!Number.isInteger(cantidadMovimientos) || cantidadMovimientos < 0) {
    throw new Error("La cantidad de movimientos no es válida")
  }

  if (!Number.isFinite(precioMovimiento) || precioMovimiento < 0) {
    throw new Error("El precio por movimiento no puede ser negativo")
  }

  if (
    !Number.isFinite(porcentajeIGV) ||
    porcentajeIGV < 0 ||
    porcentajeIGV > 100
  ) {
    throw new Error("El porcentaje de IGV debe estar entre 0 y 100")
  }

  // ============================================================
  // 2. CALCULAR MOVIMIENTOS
  // ============================================================

  const subtotalMovimientos = cantidadMovimientos * precioMovimiento

  // ============================================================
  // 3. CALCULAR SUBTOTAL
  // ============================================================

  const subtotal = precioIngresoSalida + subtotalMovimientos

  // ============================================================
  // 4. CALCULAR IGV
  // ============================================================

  const montoIGV =
    tratamientoIGV === "CON_IGV" ? subtotal * (porcentajeIGV / 100) : 0

  // ============================================================
  // 5. CALCULAR TOTAL
  // ============================================================

  const montoTotal = subtotal + montoIGV

  return {
    subtotal: redondear(subtotal),
    montoIGV: redondear(montoIGV),
    montoTotal: redondear(montoTotal),
  }
}

/**
 * Redondea un importe a dos decimales.
 */
function redondear(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100
}
