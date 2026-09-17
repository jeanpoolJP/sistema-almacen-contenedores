"use client"

import * as React from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/**
 * Input que fuerza el valor a MAYÚSCULAS.
 *
 * - Se ve en mayúsculas mientras escribes.
 * - El `value` interno también queda en mayúsculas (se envía así al backend).
 * - Al pegar, también se transforma.
 *
 * NO usar en campos como teléfono, RUC si prefieres mantener formato,
 * aunque RUC/placa/licencia sí conviene en mayúsculas.
 */
export const InputUppercase = React.forwardRef<
  React.ComponentRef<typeof Input>,
  React.ComponentProps<typeof Input>
>(({ className, onChange, value, ...props }, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const upper = e.target.value.toUpperCase()
    // Mutamos el value del evento para que RHF reciba mayúsculas
    e.target.value = upper
    onChange?.(e)
  }

  return (
    <Input
      ref={ref}
      value={value}
      onChange={handleChange}
      // text-transform es solo refuerzo visual; el value ya viene en mayúsculas
      className={cn("uppercase", className)}
      {...props}
    />
  )
})
InputUppercase.displayName = "InputUppercase"
