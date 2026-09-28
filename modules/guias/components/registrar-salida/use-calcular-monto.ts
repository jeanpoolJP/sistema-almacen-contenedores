// modules/guias/components/registrar-salida/use-calcular-monto.ts

"use client"

import { useMemo } from "react"

import type { TratamientoIGV, TipoPrecioGuia } from "@/lib/generated/prisma"
import { calcularMontoGuia } from "../../utils/calcular-monto"
import {
  calcularMontoEspacioAlquilado,
} from "../../utils/calcular-monto-espacio-alquilado"

import type { CalculoMonto, PrecioBase } from "./types"

type UseCalcularMontoOptions = {
  tipoPrecio: TipoPrecioGuia | undefined
  diasAlmacenamiento: number | undefined
  precioPrimerDia: number | undefined
  precioDiaAdicional: number | undefined
  precioIngresoSalida: number | undefined
  cantidadMovimientos: number | undefined
  tratamientoIGV: TratamientoIGV
  /**
   * Precio estándar del primer día.
   * Para contenedores REEFER se fija en 40;
   * para los demás, proviene de la configuración global.
   */
  precioPrimerDiaEstandar: number | undefined
  precioBase: PrecioBase | null
  /**
   * Porcentaje de IGV propio de la guía (si ya fue personalizado).
   * Cuando es null, se usa el de la configuración global.
   */
  porcentajeIGVGuia: number | null
}

/**
 * Calcula en tiempo real el monto a cobrar
 * según el tipo de precio y los valores del formulario.
 *
 * Retorna `null` cuando los datos son incompletos
 * o las funciones de cálculo lanzan una excepción
 * por datos inválidos (ej. días < 1).
 */
export function useCalcularMonto({
  tipoPrecio,
  diasAlmacenamiento,
  precioPrimerDia,
  precioDiaAdicional,
  precioIngresoSalida,
  cantidadMovimientos,
  tratamientoIGV,
  precioPrimerDiaEstandar,
  precioBase,
  porcentajeIGVGuia,
}: UseCalcularMontoOptions): CalculoMonto | null {
  return useMemo<CalculoMonto | null>(() => {
    try {
      if (!tipoPrecio) return null

      // El porcentaje IGV de la guía tiene prioridad sobre la configuración global.
      const porcentajeIGV =
        porcentajeIGVGuia !== null
          ? Number(porcentajeIGVGuia)
          : precioBase?.porcentajeIGV

      if (porcentajeIGV === undefined) return null

      // ── ESTANDAR / PERSONALIZADO ──────────────────────────────
      if (tipoPrecio === "ESTANDAR") {
        if (
          !precioBase ||
          !diasAlmacenamiento ||
          diasAlmacenamiento < 1 ||
          precioPrimerDiaEstandar === undefined ||
          precioBase.precioDiaAdicional === undefined
        ) {
          return null
        }

        return calcularMontoGuia({
          diasAlmacenamiento: Number(diasAlmacenamiento),
          precioPrimerDia: precioPrimerDiaEstandar,
          precioDiaAdicional: precioBase.precioDiaAdicional,
          tratamientoIGV,
          porcentajeIGV,
        })
      }

      if (tipoPrecio === "PERSONALIZADO") {
        if (
          !diasAlmacenamiento ||
          diasAlmacenamiento < 1 ||
          precioPrimerDia === undefined ||
          precioPrimerDia <= 0 ||
          precioDiaAdicional === undefined ||
          precioDiaAdicional < 0
        ) {
          return null
        }

        return calcularMontoGuia({
          diasAlmacenamiento: Number(diasAlmacenamiento),
          precioPrimerDia: Number(precioPrimerDia),
          precioDiaAdicional: Number(precioDiaAdicional),
          tratamientoIGV,
          porcentajeIGV,
        })
      }

      // ── ESPACIO ALQUILADO ─────────────────────────────────────
      if (tipoPrecio === "ESPACIO_ALQUILADO") {
        if (
          precioIngresoSalida === undefined ||
          precioIngresoSalida < 0 ||
          cantidadMovimientos === undefined ||
          cantidadMovimientos < 0
        ) {
          return null
        }

        return calcularMontoEspacioAlquilado({
          precioIngresoSalida: Number(precioIngresoSalida),
          cantidadMovimientos: Number(cantidadMovimientos),
          tratamientoIGV,
          porcentajeIGV,
        })
      }

      return null
    } catch {
      // Los validadores internos de calcularMontoGuia / calcularMontoEspacioAlquilado
      // lanzan errores con datos incompletos; los silenciamos y retornamos null.
      return null
    }
  }, [
    tipoPrecio,
    diasAlmacenamiento,
    precioPrimerDia,
    precioDiaAdicional,
    precioIngresoSalida,
    cantidadMovimientos,
    tratamientoIGV,
    precioBase,
    precioPrimerDiaEstandar,
    porcentajeIGVGuia,
  ])
}
