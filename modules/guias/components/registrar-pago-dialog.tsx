"use client"

import { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CreditCard, WalletCards } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
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

import {
  registrarPagoGuiaSchema,
  type RegistrarPagoGuiaSchema,
} from "../guia.schema"
import { registrarPagoGuiaAction } from "../guia.actions"

import { FechaHoraField } from "./fields/fecha-hora-field"
import type { GuiaConRelaciones } from "./guia-con-relaciones.type"

type RegistrarPagoDialogProps = {
  guia: GuiaConRelaciones
  open: boolean
  onOpenChange: (open: boolean) => void
  onRegistrado?: () => void
}

function formatMoneda(valor: number | null) {
  if (valor === null || valor === undefined) {
    return "—"
  }

  return `S/ ${valor.toFixed(2)}`
}

export function RegistrarPagoDialog({
  guia,
  open,
  onOpenChange,
  onRegistrado,
}: RegistrarPagoDialogProps) {
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<RegistrarPagoGuiaSchema>({
    resolver: zodResolver(registrarPagoGuiaSchema),

    defaultValues: {
      guiaId: guia.id,
      metodoPago: "YAPE",
      numeroOperacion: "",
      fechaPago: undefined,
      horaPago: undefined,
    },
  })

  async function onSubmit(data: RegistrarPagoGuiaSchema) {
    setSubmitting(true)

    const res = await registrarPagoGuiaAction(data)

    setSubmitting(false)

    if (!res.success) {
      toast.error(res.message)
      return
    }

    toast.success(res.message)

    form.reset({
      guiaId: guia.id,
      metodoPago: undefined,
      numeroOperacion: "",
      fechaPago: undefined,
      horaPago: undefined,
    })

    onOpenChange(false)
    onRegistrado?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1rem)] max-w-lg overflow-hidden p-0 sm:w-[calc(100%-2rem)]">
        <DialogHeader className="border-b px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <CreditCard className="size-5" />

            <DialogTitle>Registrar pago — Guía {guia.numeroGuia}</DialogTitle>
          </div>

          <DialogDescription>
            Registra la información del pago realizado por el cliente.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] px-4 sm:px-6">
          <FormProvider {...form}>
            <form
              id="registrar-pago-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 py-4"
            >
              {/* ============================================================
                  RESUMEN DEL PAGO
              ============================================================ */}

              <div className="rounded-lg border bg-muted/40 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Monto total de la guía
                    </p>

                    <p className="text-xl font-semibold">
                      {formatMoneda(guia.montoTotal)}
                    </p>
                  </div>

                  <WalletCards className="size-6 text-muted-foreground" />
                </div>
              </div>

              <Separator />

              {/* ============================================================
                  MÉTODO DE PAGO
              ============================================================ */}

              <FormField
                control={form.control}
                name="metodoPago"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de pago</FormLabel>

                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona un método" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value="EFECTIVO">Efectivo</SelectItem>

                        <SelectItem value="YAPE">Yape</SelectItem>

                        <SelectItem value="PLIN">Plin</SelectItem>

                        <SelectItem value="TRANSFERENCIA">
                          Transferencia bancaria
                        </SelectItem>

                        <SelectItem value="TARJETA">Tarjeta</SelectItem>

                        <SelectItem value="OTRO">Otro</SelectItem>
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ============================================================
                  NÚMERO DE OPERACIÓN
              ============================================================ */}

              <FormField
                control={form.control}
                name="numeroOperacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Número de operación
                      <span className="ml-1 text-muted-foreground">
                        (opcional)
                      </span>
                    </FormLabel>

                    <FormControl>
                      <Input
                        placeholder="Ej. 123456789"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>

                    <p className="text-xs text-muted-foreground">
                      Puedes dejarlo vacío si el pago fue en efectivo.
                    </p>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ============================================================
                  FECHA Y HORA
              ============================================================ */}

              <FechaHoraField
                fechaName="fechaPago"
                horaName="horaPago"
                label="Fecha y hora de pago"
              />
            </form>
          </FormProvider>
        </ScrollArea>

        <DialogFooter className="border-t px-4 py-4 sm:px-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            form="registrar-pago-form"
            disabled={submitting}
            className="w-full gap-2 sm:w-auto"
          >
            <CreditCard className="size-4" />

            {submitting ? "Guardando..." : "Registrar pago"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
