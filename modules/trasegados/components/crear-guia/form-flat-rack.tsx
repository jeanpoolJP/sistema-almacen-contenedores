// modules\trasegados\components\crear-guia\form-flat-rack.tsx

"use client"

import { Loader2Icon, LockIcon } from "lucide-react"
import { useEffect } from "react"
import type { UseFormReturn } from "react-hook-form"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { cn } from "@/lib/utils"

import { UppercaseInput } from "../shared/uppercase-input"
import { buscarFlatRackAction } from "../../actions/buscar-entidades.action"
import { useEntidadLookup } from "../../hooks/use-entidad-lookup"
import type { CrearGuiaTrasegadoInput } from "../../schemas/crear-guia-trasegado.schema"

interface FormFlatRackProps {
  form: UseFormReturn<CrearGuiaTrasegadoInput>
  index: number
}

type FlatRackData = {
  id: number
  numero: string
  marca: string
}

export function FormFlatRack({ form, index }: FormFlatRackProps) {
  const { encontrada, data, buscando, buscar, reset } = useEntidadLookup<
    string,
    FlatRackData
  >(buscarFlatRackAction)

  const numeroValue = form.watch(`ingreso.elementos.${index}.flatRack.numero`)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (numeroValue && numeroValue.length >= 7) {
        buscar(numeroValue)
      } else {
        reset()
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [numeroValue, buscar, reset])

  useEffect(() => {
    if (encontrada && data) {
      form.setValue(`ingreso.elementos.${index}.flatRack.marca`, data.marca, {
        shouldValidate: false,
      })
    }
  }, [encontrada, data, form, index])

  const bloqueado = encontrada && !!data

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <FormField
        control={form.control}
        name={`ingreso.elementos.${index}.flatRack.numero`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              Número <span className="text-destructive">*</span>
              {buscando && (
                <Loader2Icon className="size-3 animate-spin text-muted-foreground" />
              )}
              {bloqueado && (
                <span className="inline-flex items-center gap-1 text-xs font-normal text-amber-600">
                  <LockIcon className="size-3" />
                  Encontrado
                </span>
              )}
            </FormLabel>
            <FormControl>
              <UppercaseInput placeholder="FR-001" {...field} />
            </FormControl>
            {!bloqueado && numeroValue && !buscando && (
              <p className="text-xs text-muted-foreground">
                No existe. La marca es obligatoria para registrarlo.
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`ingreso.elementos.${index}.flatRack.marca`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Marca</FormLabel>
            <FormControl>
              <UppercaseInput
                placeholder="Marca del flat rack"
                value={field.value ?? ""}
                onChange={field.onChange}
                disabled={bloqueado}
                className={cn(bloqueado && "bg-muted")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
