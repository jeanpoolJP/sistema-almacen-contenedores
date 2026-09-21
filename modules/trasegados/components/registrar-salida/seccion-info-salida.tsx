// modules\trasegados\components\registrar-salida\seccion-info-salida.tsx

"use client"

import { ClockIcon } from "lucide-react"
import { useEffect, useState } from "react"
import type { UseFormReturn } from "react-hook-form"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { createLimaDate } from "@/lib/date/create"
import { formatDateInput, formatTimeInput } from "@/lib/date/format"

import { FormSection } from "../shared"
import type { RegistrarSalidaInput } from "../../schemas/registrar-salida.schema"

interface SeccionInfoSalidaProps {
  form: UseFormReturn<RegistrarSalidaInput>
}

/**
 * Captura fecha y hora de salida en dos campos separados.
 * Se combinan en un único `Date` UTC con createLimaDate.
 */
export function SeccionInfoSalida({ form }: SeccionInfoSalidaProps) {
  const fechaSalida = form.watch("fechaSalida")

  const [fechaStr, setFechaStr] = useState(() =>
    formatDateInput(fechaSalida ?? new Date())
  )
  const [horaStr, setHoraStr] = useState(() =>
    formatTimeInput(fechaSalida ?? new Date())
  )

  useEffect(() => {
    if (!fechaSalida) return
    setFechaStr(formatDateInput(fechaSalida))
    setHoraStr(formatTimeInput(fechaSalida))
  }, [fechaSalida])

  const combinar = (fecha: string, hora: string) => {
    if (!fecha || !hora) return
    try {
      const d = createLimaDate(fecha, hora)
      form.setValue("fechaSalida", d, {
        shouldValidate: true,
        shouldDirty: true,
      })
    } catch {
      // Ignorar mientras se escribe
    }
  }

  return (
    <FormSection
      title="Información de la salida"
      description="Fecha, hora y observaciones del retiro."
      icon={<ClockIcon className="size-4" />}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <FormField
          control={form.control}
          name="fechaSalida"
          render={() => (
            <FormItem>
              <FormLabel>
                Fecha de salida <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={fechaStr}
                  onChange={(e) => {
                    setFechaStr(e.target.value)
                    combinar(e.target.value, horaStr)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fechaSalida"
          render={() => (
            <FormItem>
              <FormLabel>
                Hora de salida <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="time"
                  value={horaStr}
                  step={60}
                  onChange={(e) => {
                    setHoraStr(e.target.value)
                    combinar(fechaStr, e.target.value)
                  }}
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
                  placeholder="OBSERVACIONES DEL RETIRO..."
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
