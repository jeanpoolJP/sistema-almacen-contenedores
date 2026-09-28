// modules/guias/components/registrar-salida/calculo-preview.tsx

"use client"

import type { TipoPrecioGuia } from "@/lib/generated/prisma"

import { Separator } from "@/components/ui/separator"
import { calcularPrecioMovimientos } from "../../utils/calcular-monto-espacio-alquilado"

import type { CalculoMonto, PrecioBase } from "./types"
import { formatearMonto } from "./utils"

type CalculoPreviewProps = {
  tipoPrecio: TipoPrecioGuia | undefined
  calculo: CalculoMonto | null
  diasAlmacenamiento: number | undefined
  precioPrimerDia: number | undefined
  precioDiaAdicional: number | undefined
  precioIngresoSalida: number | undefined
  cantidadMovimientos: number | undefined
  /**
   * Precio del primer día para el modo ESTANDAR
   * (puede diferir del campo del formulario cuando el contenedor es REEFER).
   */
  precioPrimerDiaEstandar: number | undefined
  precioBase: PrecioBase | null
}

/**
 * Previsualización del cálculo monetario en tiempo real.
 *
 * Renderiza un desglose diferente según el tipo de precio:
 * - ESTANDAR / PERSONALIZADO: primer día + días adicionales + subtotal + IGV + total
 * - ESPACIO_ALQUILADO: precio ingreso/salida + movimientos + subtotal + IGV + total
 *
 * Muestra un placeholder cuando los datos son insuficientes para calcular.
 */
export function CalculoPreview({
  tipoPrecio,
  calculo,
  diasAlmacenamiento,
  precioPrimerDia,
  precioDiaAdicional,
  precioIngresoSalida,
  cantidadMovimientos,
  precioPrimerDiaEstandar,
  precioBase,
}: CalculoPreviewProps) {
  if (!calculo) {
    return (
      <div className="rounded-lg border bg-muted/50 p-4 text-center text-sm text-muted-foreground">
        Completa los datos para calcular el monto
      </div>
    )
  }

  // ── ESTANDAR / PERSONALIZADO ────────────────────────────────────────────
  if (tipoPrecio === "ESTANDAR" || tipoPrecio === "PERSONALIZADO") {
    const diasAdicionales = Math.max(0, Number(diasAlmacenamiento || 0) - 1)

    const precioPrimerDiaMostrar =
      tipoPrecio === "ESTANDAR"
        ? precioPrimerDiaEstandar ?? 0
        : Number(precioPrimerDia) || 0

    const precioDiaAdicionalMostrar =
      tipoPrecio === "ESTANDAR"
        ? precioBase?.precioDiaAdicional ?? 0
        : Number(precioDiaAdicional) || 0

    return (
      <div className="rounded-lg border bg-primary/5 p-4">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Primer día</span>
            <span className="font-medium">
              {formatearMonto(precioPrimerDiaMostrar)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Días adicionales</span>
            <span className="font-medium">{diasAdicionales}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Precio día adicional</span>
            <span className="font-medium">
              {formatearMonto(precioDiaAdicionalMostrar)}
            </span>
          </div>

          <Separator className="my-2" />

          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">
              {formatearMonto(calculo.subtotal)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">IGV</span>
            <span className="font-medium">
              {formatearMonto(calculo.montoIGV)}
            </span>
          </div>

          <Separator className="my-2" />

          <div className="flex justify-between text-base font-bold">
            <span>Monto total</span>
            <span className="text-primary">
              {formatearMonto(calculo.montoTotal)}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // ── ESPACIO ALQUILADO ───────────────────────────────────────────────────
  if (tipoPrecio === "ESPACIO_ALQUILADO") {
    const cantidadMovimientosNumero = Number(cantidadMovimientos || 0)
    const subtotalMovimientos = calcularPrecioMovimientos(
      cantidadMovimientosNumero
    )

    return (
      <div className="rounded-lg border bg-primary/5 p-4">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Precio ingreso / salida
            </span>
            <span className="font-medium">
              {formatearMonto(Number(precioIngresoSalida) || 0)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Movimientos</span>
            <span className="font-medium">{cantidadMovimientosNumero}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Tarifa por movimientos
            </span>
            <span className="font-medium">
              {formatearMonto(subtotalMovimientos)}
            </span>
          </div>

          <Separator className="my-2" />

          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">
              {formatearMonto(calculo.subtotal)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">IGV</span>
            <span className="font-medium">
              {formatearMonto(calculo.montoIGV)}
            </span>
          </div>

          <Separator className="my-2" />

          <div className="flex justify-between text-base font-bold">
            <span>Monto total</span>
            <span className="text-primary">
              {formatearMonto(calculo.montoTotal)}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return null
}
