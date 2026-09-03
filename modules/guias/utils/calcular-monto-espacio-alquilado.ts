// modules/guias/utils/calcular-monto-espacio-alquilado.ts

import type { TratamientoIGV } from "@/lib/generated/prisma"

import type { CalculoMonto } from "../guia.types"

type DatosCalculoEspacioAlquilado = {
  precioIngresoSalida: number
  cantidadMovimientos: number

  tratamientoIGV: TratamientoIGV
  porcentajeIGV: number
}

/**
 * Determina el costo de los movimientos según la cantidad.
 *
 * Reglas:
 * 0 - 5 movimientos   → S/ 0
 * 6 - 10 movimientos  → S/ 100
 * 11 - 15 movimientos → S/ 150
 * 16 - 20 movimientos → S/ 200
 * 21+ movimientos     → S/ 250
 */
export function calcularPrecioMovimientos(cantidadMovimientos: number): number {
  if (!Number.isInteger(cantidadMovimientos) || cantidadMovimientos < 0) {
    throw new Error("La cantidad de movimientos no es válida")
  }

  if (cantidadMovimientos <= 5) {
    return 0
  }

  if (cantidadMovimientos <= 10) {
    return 100
  }

  if (cantidadMovimientos <= 15) {
    return 150
  }

  if (cantidadMovimientos <= 20) {
    return 200
  }

  return 250
}

/**
 * Calcula el monto de una guía cuyo precio
 * corresponde a un espacio alquilado.
 *
 * Fórmula:
 *
 * precio ingreso/salida
 * +
 * tarifa de movimientos según cantidad
 */
export function calcularMontoEspacioAlquilado({
  precioIngresoSalida,
  cantidadMovimientos,
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

  const subtotalMovimientos = calcularPrecioMovimientos(cantidadMovimientos)

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
