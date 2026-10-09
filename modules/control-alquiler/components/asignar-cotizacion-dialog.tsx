"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { FileTextIcon, Loader2Icon } from "lucide-react"
import { useEffect, useTransition } from "react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
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
import {
  calcularTotalesCotizacion,
  PORCENTAJE_IGV_COTIZACION,
} from "@/modules/trasegados/utils/calcular-cotizacion"

import { guardarCotizacionAlquilerAction } from "../actions/control-alquiler.actions"
import {
  cotizacionAlquilerSchema,
  type CotizacionAlquilerInput,
} from "../schemas/control-alquiler.schema"

interface AsignarCotizacionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guiaId: string
  numeroGuia: string
  numeroCotizacion: string | null
  subtotal: number | null
  total: number | null
  modoIGVCotizacion: CotizacionAlquilerInput["modoIGVCotizacion"] | null
  onSuccess: () => void
}

export function AsignarCotizacionDialog({
  open,
  onOpenChange,
  guiaId,
  numeroGuia,
  numeroCotizacion,
  subtotal,
  total,
  modoIGVCotizacion,
  onSuccess,
}: AsignarCotizacionDialogProps) {
  const [isPending, startTransition] = useTransition()
  const form = useForm<CotizacionAlquilerInput>({
    resolver: zodResolver(cotizacionAlquilerSchema),
    defaultValues: {
      guiaAlquilerId: guiaId,
      numeroCotizacion: numeroCotizacion ?? "",
      montoIngresado:
        modoIGVCotizacion === "IGV_INCLUIDO"
          ? (total ?? 0)
          : (subtotal ?? total ?? 0),
      modoIGVCotizacion: modoIGVCotizacion ?? "SIN_IGV",
    },
  })
  const { reset } = form

  useEffect(() => {
    if (!open) return
    reset({
      guiaAlquilerId: guiaId,
      numeroCotizacion: numeroCotizacion ?? "",
      montoIngresado:
        modoIGVCotizacion === "IGV_INCLUIDO"
          ? (total ?? 0)
          : (subtotal ?? total ?? 0),
      modoIGVCotizacion: modoIGVCotizacion ?? "SIN_IGV",
    })
  }, [
    guiaId,
    modoIGVCotizacion,
    numeroCotizacion,
    open,
    reset,
    subtotal,
    total,
  ])

  const montoIngresado = useWatch({
    control: form.control,
    name: "montoIngresado",
  })
  const modoSeleccionado = useWatch({
    control: form.control,
    name: "modoIGVCotizacion",
  })
  const totales = calcularTotalesCotizacion(
    Number(montoIngresado) || 0,
    modoSeleccionado
  )

  const onSubmit = form.handleSubmit((datos) => {
    startTransition(async () => {
      const result = await guardarCotizacionAlquilerAction(datos)
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      onSuccess()
      onOpenChange(false)
    })
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileTextIcon className="size-5" />
            {numeroCotizacion ? "Editar cotización" : "Asignar cotización"}
          </DialogTitle>
          <DialogDescription>
            Guía <span className="font-mono font-medium">{numeroGuia}</span>.
            Selecciona cómo aplicar el IGV al monto ingresado.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-5" autoComplete="off">
            <FormField
              control={form.control}
              name="numeroCotizacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de cotización</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      maxLength={50}
                      placeholder="Ej. COT-2026-001"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="modoIGVCotizacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tratamiento de IGV</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SIN_IGV">Sin IGV</SelectItem>
                      <SelectItem value="CON_IGV">Agregar IGV (18%)</SelectItem>
                      <SelectItem value="IGV_INCLUIDO">
                        IGV incluido en el monto
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {modoSeleccionado === "CON_IGV"
                      ? "El 18% se sumará al subtotal ingresado."
                      : modoSeleccionado === "IGV_INCLUIDO"
                        ? "El monto ingresado será el total y se desglosará el IGV."
                        : "El total será igual al monto ingresado."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="montoIngresado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {modoSeleccionado === "CON_IGV"
                      ? "Subtotal antes de IGV (S/)"
                      : modoSeleccionado === "IGV_INCLUIDO"
                        ? "Total con IGV incluido (S/)"
                        : "Monto cotizado (S/)"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0.01"
                      max="9999999.99"
                      step="0.01"
                      value={field.value || ""}
                      onChange={(event) =>
                        field.onChange(
                          event.target.value === ""
                            ? 0
                            : Number(event.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-3 rounded-md border bg-muted/30 p-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">
                  S/ {totales.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">
                  IGV
                  {modoSeleccionado !== "SIN_IGV" &&
                    ` (${PORCENTAJE_IGV_COTIZACION}%)`}
                </span>
                <span className="tabular-nums">
                  S/ {totales.montoIGV.toFixed(2)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between gap-4 font-semibold">
                <span>Total</span>
                <span className="tabular-nums">
                  S/ {totales.totalPagar.toFixed(2)}
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && (
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                )}
                Guardar cotización
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
