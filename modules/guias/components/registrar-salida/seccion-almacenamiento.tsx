// modules/guias/components/registrar-salida/seccion-almacenamiento.tsx

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { RegistrarSalidaGuiaSchema } from "../../guia.schema"
import { valorParaInput } from "./utils"

type SeccionAlmacenamientoProps = {
  /**
   * Callback que se invoca cuando el usuario cambia el tipo de precio.
   * El hook padre se encarga de sincronizar los precios del formulario.
   */
  onTipoPrecioChange: (
    value: "ESTANDAR" | "PERSONALIZADO" | "ESPACIO_ALQUILADO" | null
  ) => void
  /**
   * Marca que el usuario editó los días manualmente
   * para detener el cálculo automático.
   */
  onDiasEditados: () => void
}

/**
 * Sección de almacenamiento y precios del formulario de salida.
 *
 * Contiene:
 * - Días de almacenamiento (editable; se calcula automáticamente por el hook)
 * - Selector de tipo de precio
 * - Campos de precio primer día y precio día adicional
 *   (se muestran solo para ESTANDAR y PERSONALIZADO)
 */
export function SeccionAlmacenamiento({
  onTipoPrecioChange,
  onDiasEditados,
}: SeccionAlmacenamientoProps) {
  const form = useFormContext<RegistrarSalidaGuiaSchema>()
  const tipoPrecio = form.watch("tipoPrecio")

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Cálculo de almacenamiento</h3>

        <p className="text-xs text-muted-foreground">
          Los días se calculan automáticamente. Puedes modificar los días y, si
          corresponde, los precios.
        </p>
      </div>

      {/* DÍAS DE ALMACENAMIENTO */}
      <FormField
        control={form.control}
        name="diasAlmacenamiento"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Días de almacenamiento</FormLabel>

            <FormControl>
              <Input
                type="number"
                min="1"
                step="1"
                value={valorParaInput(field.value)}
                onChange={(e) => {
                  field.onChange(
                    e.target.value === "" ? undefined : Number(e.target.value)
                  )
                  // Notificar que el usuario editó manualmente para detener
                  // el recálculo automático.
                  onDiasEditados()
                }}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />

      {/* TIPO DE PRECIO */}
      <FormField
        control={form.control}
        name="tipoPrecio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de precio</FormLabel>

            <Select onValueChange={onTipoPrecioChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>

              <SelectContent>
                <SelectItem value="ESTANDAR">Estándar</SelectItem>
                <SelectItem value="PERSONALIZADO">Personalizado</SelectItem>
                <SelectItem value="ESPACIO_ALQUILADO">
                  Espacio alquilado
                </SelectItem>
              </SelectContent>
            </Select>

            <FormMessage />
          </FormItem>
        )}
      />

      {/* PRECIOS (solo ESTANDAR o PERSONALIZADO) */}
      {(tipoPrecio === "ESTANDAR" || tipoPrecio === "PERSONALIZADO") && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* PRECIO PRIMER DÍA */}
          <FormField
            control={form.control}
            name="precioPrimerDia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio primer día (S/)</FormLabel>

                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    disabled={tipoPrecio === "ESTANDAR"}
                    className={
                      tipoPrecio === "ESTANDAR" ? "bg-muted" : undefined
                    }
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

          {/* PRECIO DÍA ADICIONAL */}
          <FormField
            control={form.control}
            name="precioDiaAdicional"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio día adicional (S/)</FormLabel>

                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    disabled={tipoPrecio === "ESTANDAR"}
                    className={
                      tipoPrecio === "ESTANDAR" ? "bg-muted" : undefined
                    }
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
      )}
    </div>
  )
}
