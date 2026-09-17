// modules/trasegados/components/crear-guia/seccion-info-general.tsx
"use client"

import { CalendarIcon, FileTextIcon } from "lucide-react"
import { parse } from "date-fns"
import { useEffect, useState } from "react"
import type { UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { createLimaDate } from "@/lib/date/create"
import { formatDate, formatDateInput, formatTimeInput } from "@/lib/date/format"

import { FormSection } from "../shared"
import { UppercaseInput } from "../shared/uppercase-input"
import type { CrearGuiaTrasegadoInput } from "../../schemas/crear-guia-trasegado.schema"

interface SeccionInfoGeneralProps {
  form: UseFormReturn<CrearGuiaTrasegadoInput>
}

/**
 * Sección de información general de la guía.
 *
 * La fecha y hora se capturan en dos campos independientes
 * (fecha + hora) y se combinan en un único Date en UTC.
 *
 * La conversión se hace con `createLimaDate`, que interpreta
 * los valores como hora local de Lima y devuelve el instante
 * absoluto correcto para guardar en PostgreSQL.
 */
export function SeccionInfoGeneral({ form }: SeccionInfoGeneralProps) {
  const fechaIngreso = form.watch("fechaIngreso")

  // Estado local controlado de los inputs
  const [fechaStr, setFechaStr] = useState<string>(() =>
    formatDateInput(fechaIngreso ?? new Date())
  )
  const [horaStr, setHoraStr] = useState<string>(() =>
    formatTimeInput(fechaIngreso ?? new Date())
  )

  // Sincroniza los inputs si el form resetea o cambia por fuera
  useEffect(() => {
    if (!fechaIngreso) return
    setFechaStr(formatDateInput(fechaIngreso))
    setHoraStr(formatTimeInput(fechaIngreso))
  }, [fechaIngreso])

  // Combina fecha y hora en un Date UTC usando la zona de Lima
  const handleFechaChange = (value: string) => {
    setFechaStr(value)

    if (!value || !horaStr) return

    try {
      const nuevaFecha = createLimaDate(value, horaStr)
      form.setValue("fechaIngreso", nuevaFecha, {
        shouldValidate: true,
        shouldDirty: true,
      })
    } catch {
      // Si el usuario está escribiendo una fecha incompleta, ignoramos
    }
  }

  const handleHoraChange = (value: string) => {
    setHoraStr(value)

    if (!fechaStr || !value) return

    try {
      const nuevaFecha = createLimaDate(fechaStr, value)
      form.setValue("fechaIngreso", nuevaFecha, {
        shouldValidate: true,
        shouldDirty: true,
      })
    } catch {
      // Ignorar mientras se escribe
    }
  }

  return (
    <FormSection
      title="Información general"
      description="Datos básicos de la guía de trasegado."
      icon={<FileTextIcon className="size-4" />}
    >
      <div className="grid gap-5 md:grid-cols-2">
        {/* Campo: Número de guía */}
        <FormField
          control={form.control}
          name="numeroGuia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Número de guía <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <UppercaseInput
                  placeholder="TR-2026-0001"
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo: Fecha */}
        <FormField
          control={form.control}
          name="fechaIngreso"
          render={() => (
            /* Eliminamos 'className="flex flex-col"' */
            <FormItem>
              <FormLabel>
                Fecha de ingreso <span className="text-destructive">*</span>
              </FormLabel>
              <Popover>
                <FormControl>
                  <PopoverTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 size-4" />
                        {fechaStr
                          ? formatDate(
                              createLimaDate(fechaStr, horaStr || "00:00")
                            )
                          : "Seleccionar fecha"}
                      </Button>
                    }
                  />
                </FormControl>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      fechaStr
                        ? parse(fechaStr, "yyyy-MM-dd", new Date())
                        : undefined
                    }
                    onSelect={(date) => {
                      if (!date) return
                      const yyyy = date.getFullYear()
                      const mm = String(date.getMonth() + 1).padStart(2, "0")
                      const dd = String(date.getDate()).padStart(2, "0")
                      handleFechaChange(`${yyyy}-${mm}-${dd}`)
                    }}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo: Hora */}
        <FormField
          control={form.control}
          name="fechaIngreso"
          render={() => (
            /* Eliminamos 'className="flex flex-col"' */
            <FormItem>
              <FormLabel>
                Hora de ingreso <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="time"
                  value={horaStr}
                  onChange={(e) => handleHoraChange(e.target.value)}
                  step={60}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descripcionServicio"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Descripción del servicio</FormLabel>
              <FormControl>
                <UppercaseInput
                  placeholder="Detalle breve del servicio realizado (opcional)."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observaciones"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Observaciones</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="OBSERVACIONES ADICIONALES DE LA GUÍA..."
                  className={cn("resize-none uppercase")}
                  rows={3}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormSection>
  )
}
