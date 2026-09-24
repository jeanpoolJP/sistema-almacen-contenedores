// modules\trasegados\components\crear-guia\form-contenedor.tsx

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

import { UppercaseInput } from "../shared/uppercase-input"
import { buscarContenedorAction } from "../../actions/buscar-entidades.action"
import { useEntidadLookup } from "../../hooks/use-entidad-lookup"
import type { CrearGuiaTrasegadoInput } from "../../schemas/crear-guia-trasegado.schema"

interface FormContenedorProps {
  form: UseFormReturn<CrearGuiaTrasegadoInput>
  index: number
  ingresoIndex: number
}

type ContenedorData = {
  id: number
  numeroContenedor: string
  marca: string
  medida: number
  tipo: "NORMAL" | "REEFER"
}

/**
 * Sub-formulario de contenedor con autocompletado:
 *
 * - Al escribir el número, se busca en el backend.
 * - Si existe: se rellenan marca/medida/tipo y se bloquean.
 * - Si no existe: el usuario completa los campos para crearlo.
 */
export function FormContenedor({
  form,
  index,
  ingresoIndex,
}: FormContenedorProps) {
  const { encontrada, data, buscando, buscar, reset } = useEntidadLookup<
    string,
    ContenedorData
  >(buscarContenedorAction)

  const numeroValue = form.watch(
    `ingresos.${ingresoIndex}.elementos.${index}.contenedor.numeroContenedor`
  )

  // Debounce simple: buscar cuando el número cambia
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

  // Cuando se encuentra, autocompletar
  useEffect(() => {
    if (encontrada && data) {
      form.setValue(
        `ingresos.${ingresoIndex}.elementos.${index}.contenedor.marca`,
        data.marca,
        {
          shouldValidate: false,
        }
      )
      form.setValue(
        `ingresos.${ingresoIndex}.elementos.${index}.contenedor.medida`,
        data.medida,
        { shouldValidate: false }
      )
      form.setValue(
        `ingresos.${ingresoIndex}.elementos.${index}.contenedor.tipo`,
        data.tipo,
        {
          shouldValidate: false,
        }
      )
    }
  }, [encontrada, data, form, index, ingresoIndex])

  const bloqueado = encontrada && !!data

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <FormField
        control={form.control}
        name={`ingresos.${ingresoIndex}.elementos.${index}.contenedor.numeroContenedor`}
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel className="flex items-center gap-2">
              Número de contenedor <span className="text-destructive">*</span>
              {buscando && (
                <Loader2Icon className="size-3 animate-spin text-muted-foreground" />
              )}
              {bloqueado && (
                <span className="inline-flex items-center gap-1 text-xs font-normal text-amber-600">
                  <LockIcon className="size-3" />
                  Encontrado — campos bloqueados
                </span>
              )}
            </FormLabel>
            <FormControl>
              <UppercaseInput
                placeholder="7654321"
                {...field}
                disabled={buscando}
              />
            </FormControl>
            {!bloqueado && numeroValue && !buscando && (
              <p className="text-xs text-muted-foreground">
                No existe. Complétalo para registrarlo.
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`ingresos.${ingresoIndex}.elementos.${index}.contenedor.marca`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Marca <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <UppercaseInput
                placeholder="UACU"
                {...field}
                disabled={bloqueado}
                className={cn(bloqueado && "bg-muted")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`ingresos.${ingresoIndex}.elementos.${index}.contenedor.medida`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Medida <span className="text-destructive">*</span>
            </FormLabel>
            <Select
              onValueChange={(value) => field.onChange(Number(value))}
              value={String(field.value)}
              disabled={bloqueado}
            >
              <FormControl>
                <SelectTrigger className={cn(bloqueado && "bg-muted")}>
                  <SelectValue placeholder="Seleccionar medida" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="20">20 pies</SelectItem>
                <SelectItem value="40">40 pies</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`ingresos.${ingresoIndex}.elementos.${index}.contenedor.tipo`}
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>
              Tipo <span className="text-destructive">*</span>
            </FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={bloqueado}
            >
              <FormControl>
                <SelectTrigger className={cn(bloqueado && "bg-muted")}>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="REEFER">Reefer</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
