// modules\trasegados\components\crear-guia\form-mercaderia.tsx

"use client"

import type { UseFormReturn } from "react-hook-form"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import type { CrearGuiaTrasegadoInput } from "../../schemas/crear-guia-trasegado.schema"

interface FormMercaderiaProps {
  form: UseFormReturn<CrearGuiaTrasegadoInput>
  index: number
  ingresoIndex: number
}

export function FormMercaderia({
  form,
  index,
  ingresoIndex,
}: FormMercaderiaProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <FormField
        control={form.control}
        name={`ingresos.${ingresoIndex}.elementos.${index}.numero`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Número / Código <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Ej: MER-001"
                className="uppercase"
                {...field}
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`ingresos.${ingresoIndex}.elementos.${index}.descripcion`}
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>
              Descripción <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="Descripción de la mercadería" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
