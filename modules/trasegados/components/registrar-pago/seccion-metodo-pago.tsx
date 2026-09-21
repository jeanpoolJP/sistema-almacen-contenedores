// modules\trasegados\components\registrar-pago\seccion-metodo-pago.tsx

"use client"

import { CreditCardIcon } from "lucide-react"
import { useEffect, useState } from "react"
import type { UseFormReturn } from "react-hook-form"

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { createLimaDate } from "@/lib/date/create"
import { formatDateInput, formatTimeInput } from "@/lib/date/format"

import { FormSection } from "../shared"
import { UppercaseInput } from "../shared/uppercase-input"
import {
  ETIQUETAS_METODO_PAGO,
  METODOS_PAGO,
  type RegistrarPagoInput,
} from "../../schemas/registrar-pago.schema"

interface SeccionMetodoPagoProps {
  form: UseFormReturn<RegistrarPagoInput>
}

export function SeccionMetodoPago({ form }: SeccionMetodoPagoProps) {
  const metodoPago = form.watch("metodoPago")
  const fechaPago = form.watch("fechaPago")

  const [fechaStr, setFechaStr] = useState(() =>
    formatDateInput(fechaPago ?? new Date())
  )
  const [horaStr, setHoraStr] = useState(() =>
    formatTimeInput(fechaPago ?? new Date())
  )

  useEffect(() => {
    if (!fechaPago) return
    setFechaStr(formatDateInput(fechaPago))
    setHoraStr(formatTimeInput(fechaPago))
  }, [fechaPago])

  const combinar = (fecha: string, hora: string) => {
    if (!fecha || !hora) return
    try {
      form.setValue("fechaPago", createLimaDate(fecha, hora), {
        shouldValidate: true,
      })
    } catch {
      // Ignorar mientras se escribe
    }
  }

  const requiereOperacion = metodoPago !== "EFECTIVO"

  return (
    <FormSection
      title="Método y fecha de pago"
      description="Define cómo se realizó el pago."
      icon={<CreditCardIcon className="size-4" />}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <FormField
          control={form.control}
          name="metodoPago"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Método de pago <span className="text-destructive">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {METODOS_PAGO.map((m) => (
                    <SelectItem key={m} value={m}>
                      {ETIQUETAS_METODO_PAGO[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="numeroOperacion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={cn(requiereOperacion && "text-foreground")}>
                Número de operación{" "}
                {requiereOperacion && (
                  <span className="text-destructive">*</span>
                )}
              </FormLabel>
              <FormControl>
                <UppercaseInput
                  placeholder="N° DE OPERACIÓN"
                  disabled={!requiereOperacion}
                  className={cn(!requiereOperacion && "bg-muted")}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              </FormControl>
              {!requiereOperacion && (
                <FormDescription>
                  No aplica para pagos en efectivo.
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fechaPago"
          render={() => (
            <FormItem>
              <FormLabel>
                Fecha de pago <span className="text-destructive">*</span>
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
          name="fechaPago"
          render={() => (
            <FormItem>
              <FormLabel>
                Hora de pago <span className="text-destructive">*</span>
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
                  placeholder="OBSERVACIONES DEL PAGO..."
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
    </FormSection>
  )
}
