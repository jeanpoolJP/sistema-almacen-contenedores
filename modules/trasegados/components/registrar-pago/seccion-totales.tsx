// modules\trasegados\components\registrar-pago\seccion-totales.tsx

"use client"

import { CalculatorIcon } from "lucide-react"
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
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

import { FormSection } from "../shared"
import { formatearSoles } from "../../utils/calcular-totales"
import type { RegistrarPagoInput } from "../../schemas/registrar-pago.schema"
import type { TotalesCalculados } from "../../utils/calcular-totales"

interface SeccionTotalesProps {
  form: UseFormReturn<RegistrarPagoInput>
  totales: TotalesCalculados
}

export function SeccionTotales({ form, totales }: SeccionTotalesProps) {
  const tratamientoIGV = form.watch("tratamientoIGV")

  return (
    <FormSection
      title="Totales"
      description="Ingresa el monto base y define el tratamiento de IGV."
      icon={<CalculatorIcon className="size-4" />}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <FormField
          control={form.control}
          name="montoBase"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Monto base (sin IGV) <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="tabular-nums"
                  value={field.value || ""}
                  onChange={(e) => {
                    const v = e.target.value
                    field.onChange(v === "" ? 0 : Number(v))
                  }}
                />
              </FormControl>
              <FormDescription>El IGV se suma al monto base.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tratamientoIGV"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Tratamiento de IGV <span className="text-destructive">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="SIN_IGV">Sin IGV</SelectItem>
                  <SelectItem value="CON_IGV">Con IGV (18%)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {tratamientoIGV === "CON_IGV" && (
          <FormField
            control={form.control}
            name="porcentajeIGV"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Porcentaje de IGV (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    className="tabular-nums"
                    value={field.value}
                    onChange={(e) =>
                      field.onChange(Number(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      <Separator className="my-6" />

      {/* Resumen de totales calculados */}
      <div className="space-y-2 rounded-md border bg-muted/30 p-4 text-sm">
        <FilaTotal label="Subtotal" value={formatearSoles(totales.subtotal)} />
        {tratamientoIGV === "CON_IGV" && (
          <FilaTotal
            label={`IGV (${totales.porcentajeIGV}%)`}
            value={formatearSoles(totales.montoIGV)}
          />
        )}
        <Separator />
        <FilaTotal
          label="Total a pagar"
          value={formatearSoles(totales.totalPagar)}
          bold
        />
      </div>
    </FormSection>
  )
}

function FilaTotal({
  label,
  value,
  bold,
}: {
  label: string
  value: string
  bold?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn("text-muted-foreground", bold && "text-foreground")}>
        {label}
      </span>
      <span
        className={cn(
          "tabular-nums",
          bold && "text-base font-semibold text-foreground"
        )}
      >
        {value}
      </span>
    </div>
  )
}
