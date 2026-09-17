// modules\trasegados\components\shared\uppercase-input.tsx

"use client"

import { forwardRef, type ComponentProps } from "react"

import { Input } from "@/components/ui/input"

/**
 * Input que fuerza mayúsculas visualmente y en el valor
 * mientras el usuario escribe, sin importar el estado
 * del Bloq Mayús.
 */
export const UppercaseInput = forwardRef<
  HTMLInputElement,
  ComponentProps<typeof Input>
>(function UppercaseInput({ onChange, className, ...props }, ref) {
  return (
    <Input
      ref={ref}
      {...props}
      onChange={(e) => {
        const upper = e.target.value.toUpperCase()
        // Forzamos el valor visualmente también
        e.target.value = upper
        onChange?.(e)
      }}
      className={`uppercase ${className ?? ""}`}
    />
  )
})
