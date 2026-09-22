// modules/trasegados/components/crear-guia/elemento-form-card.tsx
"use client"

import { Trash2Icon } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

import { FormContenedor } from "./form-contenedor"
import { FormFlatRack } from "./form-flat-rack"
import { FormMercaderia } from "./form-mercaderia"
import { FormMaquinaria } from "./form-maquinaria"
import { ETIQUETAS_TIPO_ELEMENTO } from "../../types"
import type { CrearGuiaTrasegadoInput } from "../../schemas/crear-guia-trasegado.schema"
import type { ElementoTrasegadoFormValue } from "../../types"

interface ElementoFormCardProps {
  form: UseFormReturn<CrearGuiaTrasegadoInput>
  index: number
  ingresoIndex: number
  tipo: ElementoTrasegadoFormValue["tipo"]
  onRemove: () => void
  puedeEliminar: boolean
}

/**
 * Tarjeta que renderiza el sub-formulario según el tipo de elemento.
 */
export function ElementoFormCard({
  form,
  index,
  ingresoIndex,
  tipo,
  onRemove,
  puedeEliminar,
}: ElementoFormCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono text-xs">
            #{index + 1}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {
              ETIQUETAS_TIPO_ELEMENTO[
                tipo as keyof typeof ETIQUETAS_TIPO_ELEMENTO
              ]
            }
          </Badge>
        </div>

        {puedeEliminar && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-destructive hover:bg-destructive/10"
            onClick={onRemove}
            aria-label="Eliminar elemento"
          >
            <Trash2Icon className="size-4" />
          </Button>
        )}
      </div>

      {tipo === "CONTENEDOR" && (
        <FormContenedor form={form} index={index} ingresoIndex={ingresoIndex} />
      )}
      {tipo === "FLAT_RACK" && (
        <FormFlatRack form={form} index={index} ingresoIndex={ingresoIndex} />
      )}
      {tipo === "MERCADERIA" && (
        <FormMercaderia form={form} index={index} ingresoIndex={ingresoIndex} />
      )}
      {tipo === "MAQUINARIA" && (
        <FormMaquinaria form={form} index={index} ingresoIndex={ingresoIndex} />
      )}

      <div className="mt-4">
        <FormField
          control={form.control}
          name={`ingresos.${ingresoIndex}.elementos.${index}.observaciones`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Observaciones</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="OBSERVACIONES DEL ELEMENTO..."
                  className="resize-none uppercase"
                  rows={2}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
