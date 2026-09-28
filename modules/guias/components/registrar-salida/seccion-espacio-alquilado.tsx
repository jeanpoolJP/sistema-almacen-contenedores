// modules/guias/components/registrar-salida/seccion-espacio-alquilado.tsx

"use client"

import { useFormContext } from "react-hook-form"

import { Input } from "@/components/ui/input"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import type { RegistrarSalidaGuiaSchema } from "../../guia.schema"
import { valorParaInput } from "./utils"

/**
 * Sección de campos específicos del modo ESPACIO_ALQUILADO.
 *
 * Aparece solo cuando tipoPrecio === "ESPACIO_ALQUILADO".
 * Contiene los campos precioIngresoSalida y cantidadMovimientos.
 */
export function SeccionEspacioAlquilado() {
  const form = useFormContext<RegistrarSalidaGuiaSchema>()

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* PRECIO INGRESO / SALIDA */}
      <FormField
        control={form.control}
        name="precioIngresoSalida"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Precio ingreso / salida (S/)</FormLabel>

            <FormControl>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={valorParaInput(field.value)}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? undefined : Number(e.target.value)
                  )
                }
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            </FormControl>

            <FormMessage />

            <p className="text-xs text-muted-foreground">
              Precio base por ingreso y salida. Puedes modificarlo para esta
              guía.
            </p>
          </FormItem>
        )}
      />

      {/* CANTIDAD DE MOVIMIENTOS */}
      <FormField
        control={form.control}
        name="cantidadMovimientos"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cantidad de movimientos</FormLabel>

            <FormControl>
              <Input
                type="number"
                min="0"
                step="1"
                value={valorParaInput(field.value)}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? undefined : Number(e.target.value)
                  )
                }
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
