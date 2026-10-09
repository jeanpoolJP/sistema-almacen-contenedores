"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CreditCardIcon } from "lucide-react"
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
import { formatDateInput, formatTimeInput } from "@/lib/date/format"

import { registrarPagoAlquilerAction } from "../actions/control-alquiler.actions"
import {
  pagoAlquilerSchema,
  type PagoAlquilerInput,
} from "../schemas/control-alquiler.schema"

const METODOS_PAGO = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "YAPE", label: "Yape" },
  { value: "PLIN", label: "Plin" },
  { value: "TRANSFERENCIA", label: "Transferencia bancaria" },
  { value: "TARJETA", label: "Tarjeta" },
  { value: "OTRO", label: "Otro" },
] as const

type GuiaPago = {
  id: string
  numeroGuia: string
  numeroCotizacion: string | null
  total: number | null
  estadoPago: "PENDIENTE" | "PAGADO"
  metodoPago: (typeof METODOS_PAGO)[number]["value"] | null
  numeroOperacion: string | null
  fechaPago: string | null
  horaPago: string | null
}

interface RegistrarPagoDialogProps {
  guia: GuiaPago | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

function valoresIniciales(guia: GuiaPago): PagoAlquilerInput {
  const ahora = new Date()
  return {
    guiaAlquilerId: guia.id,
    metodoPago: guia.metodoPago ?? "EFECTIVO",
    numeroOperacion: guia.numeroOperacion ?? "",
    fechaPago: guia.fechaPago ?? formatDateInput(ahora),
    horaPago: guia.horaPago ?? formatTimeInput(ahora),
  }
}

export function RegistrarPagoDialog({
  guia,
  open,
  onOpenChange,
  onSuccess,
}: RegistrarPagoDialogProps) {
  const [isPending, startTransition] = useTransition()
  const form = useForm<PagoAlquilerInput>({
    resolver: zodResolver(pagoAlquilerSchema),
    defaultValues: {
      guiaAlquilerId: "",
      metodoPago: "EFECTIVO",
      numeroOperacion: "",
      fechaPago: "",
      horaPago: "",
    },
    mode: "onBlur",
  })
  const metodoPago = useWatch({
    control: form.control,
    name: "metodoPago",
  })

  useEffect(() => {
    if (open && guia) form.reset(valoresIniciales(guia))
  }, [open, guia, form])

  function onSubmit(datos: PagoAlquilerInput) {
    startTransition(async () => {
      const respuesta = await registrarPagoAlquilerAction(datos)
      if (!respuesta.success) {
        toast.error(respuesta.message)
        return
      }

      toast.success(respuesta.message)
      onOpenChange(false)
      onSuccess()
    })
  }

  if (!guia) return null

  const esEfectivo = metodoPago === "EFECTIVO"
  const esEdicion = guia.estadoPago === "PAGADO"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCardIcon className="size-5" />
            {esEdicion ? "Editar pago" : "Registrar pago"} — Guía{" "}
            {guia.numeroGuia}
          </DialogTitle>
          <DialogDescription>
            Registra el pago de la cotización. La guía se marcará como pagada al
            guardar.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Cotización</span>
            <span className="font-medium">
              {guia.numeroCotizacion ?? "Sin cotización"}
            </span>
          </div>
          <div className="mt-1 flex justify-between gap-4">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold">
              {guia.total === null ? "—" : `S/ ${guia.total.toFixed(2)}`}
            </span>
          </div>
        </div>

        <Form {...form}>
          <form
            id="registrar-pago-alquiler-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="metodoPago"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de pago</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value)
                      if (value === "EFECTIVO") {
                        form.setValue("numeroOperacion", "")
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un método" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {METODOS_PAGO.map((metodo) => (
                        <SelectItem key={metodo.value} value={metodo.value}>
                          {metodo.label}
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
                  <FormLabel>
                    Número de operación{!esEfectivo && " *"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      disabled={esEfectivo}
                      placeholder={
                        esEfectivo
                          ? "No aplica para efectivo"
                          : "Ingresa el número de operación"
                      }
                      maxLength={100}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="fechaPago"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de pago</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="horaPago"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de pago</FormLabel>
                    <FormControl>
                      <Input type="time" step={60} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="registrar-pago-alquiler-form"
            disabled={
              isPending || !guia.numeroCotizacion || guia.total === null
            }
          >
            {isPending
              ? "Guardando..."
              : esEdicion
                ? "Guardar cambios"
                : "Registrar pago"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
