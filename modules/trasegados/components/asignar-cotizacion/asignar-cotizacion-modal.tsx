"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { FileTextIcon, Loader2Icon, SaveIcon } from "lucide-react"
import { useEffect, useTransition } from "react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

import { guardarCotizacionAction } from "../../actions/cotizacion.action"
import {
  cotizacionSchema,
  type ModoIGVCotizacionValue,
  type CotizacionInput,
} from "../../schemas/cotizacion.schema"
import {
  calcularTotalesCotizacion,
  PORCENTAJE_IGV_COTIZACION,
} from "../../utils/calcular-cotizacion"

interface AsignarCotizacionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guiaId: number
  numeroGuia: string
  numeroCotizacion: string | null
  montoPagar: number | null
  subtotal: number | null
  modoIGVCotizacion: ModoIGVCotizacionValue
  onSuccess?: () => void
}

export function AsignarCotizacionModal({
  open,
  onOpenChange,
  guiaId,
  numeroGuia,
  numeroCotizacion,
  montoPagar,
  subtotal,
  modoIGVCotizacion,
  onSuccess,
}: AsignarCotizacionModalProps) {
  const [isPending, startTransition] = useTransition()
  const form = useForm<CotizacionInput>({
    resolver: zodResolver(cotizacionSchema),
    defaultValues: {
      guiaTrasegadoId: guiaId,
      numeroCotizacion: numeroCotizacion ?? "",
      montoIngresado:
        modoIGVCotizacion === "IGV_INCLUIDO"
          ? (montoPagar ?? 0)
          : (subtotal ?? montoPagar ?? 0),
      modoIGVCotizacion,
    },
  })
  const { reset } = form

  useEffect(() => {
    if (!open) return
    reset({
      guiaTrasegadoId: guiaId,
      numeroCotizacion: numeroCotizacion ?? "",
      montoIngresado:
        modoIGVCotizacion === "IGV_INCLUIDO"
          ? (montoPagar ?? 0)
          : (subtotal ?? montoPagar ?? 0),
      modoIGVCotizacion,
    })
  }, [
    guiaId,
    modoIGVCotizacion,
    montoPagar,
    numeroCotizacion,
    open,
    reset,
    subtotal,
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

  const onSubmit = form.handleSubmit((data) => {
    startTransition(async () => {
      const result = await guardarCotizacionAction(data)
      if (!result.success) {
        toast.error(result.message)
        return
      }

      toast.success(result.message)
      onSuccess?.()
      onOpenChange(false)
    })
  })

  const editando = Boolean(numeroCotizacion)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileTextIcon className="size-5" />
            {editando ? "Editar cotización" : "Asignar cotización"}
          </DialogTitle>
          <DialogDescription>
            Guía <span className="font-mono font-medium">{numeroGuia}</span>. El
            Define cómo se aplica el IGV al monto cotizado.
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
                      placeholder="Ej. COT-2026-001"
                      maxLength={100}
                      {...field}
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
                      ? "El 18% se sumará al monto ingresado."
                      : modoSeleccionado === "IGV_INCLUIDO"
                        ? "El monto ingresado será el total; el IGV se desglosará."
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
                      ? "Monto antes de IGV (S/)"
                      : modoSeleccionado === "IGV_INCLUIDO"
                        ? "Monto total con IGV incluido (S/)"
                        : "Monto cotizado (S/)"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0.01"
                      max="9999999.99"
                      step="0.01"
                      placeholder="0.00"
                      className="tabular-nums"
                      value={field.value || ""}
                      onChange={(event) => {
                        const value = event.target.value
                        field.onChange(value === "" ? 0 : Number(value))
                      }}
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
                <span>Total a pagar</span>
                <span className="tabular-nums">
                  S/ {totales.totalPagar.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <SaveIcon className="mr-2 size-4" />
                    Guardar cotización
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
