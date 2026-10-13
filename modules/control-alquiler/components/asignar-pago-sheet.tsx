// modules/control-alquiler/components/asignar-pago-sheet.tsx
"use client"

import { useEffect, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  pagoGuiaAlquilerSchema,
  type PagoGuiaAlquilerFormData,
} from "../control-alquiler.schema"
import { asignarPagoAction } from "../control-alquiler.actions"

import type { GuiaAlquilerListItem } from "../control-alquiler.types"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  guia: GuiaAlquilerListItem
}

export function AsignarPagoSheet({ open, onOpenChange, guia }: Props) {
  const [isPending, startTransition] = useTransition()

  const hoy = new Date()
  const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`
  const horaHoy = `${String(hoy.getHours()).padStart(2, "0")}:${String(hoy.getMinutes()).padStart(2, "0")}`

  const defaultValues: PagoGuiaAlquilerFormData = {
    metodoPago:
      (guia.metodoPago as PagoGuiaAlquilerFormData["metodoPago"]) ??
      "EFECTIVO",
    numeroOperacion: guia.numeroOperacion ?? null,
    fechaPago: guia.fechaPago ? new Date(guia.fechaPago) : new Date(),
    horaPago: guia.horaPago ?? horaHoy,
  }

  type FormValues = {
    metodoPago: PagoGuiaAlquilerFormData["metodoPago"]
    numeroOperacion: string | null
    fechaPago: Date
    horaPago: string
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(pagoGuiaAlquilerSchema as any),
    defaultValues,
  })

  useEffect(() => {
    if (open) {
      reset(defaultValues)
    }
  }, [open, guia, reset, horaHoy])

  const onSubmit = (data: PagoGuiaAlquilerFormData) => {
    startTransition(async () => {
      const res = await asignarPagoAction(guia.id, data)
      if (res.success) {
        toast.success(res.message)
        onOpenChange(false)
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[90vw] max-w-xl overflow-y-auto p-0 sm:max-w-xl">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle>Registrar pago</DialogTitle>
          <DialogDescription>
            Guía <span className="font-medium">{guia.numeroGuia}</span> — Total:{" "}
            <span className="font-medium">
              {guia.total != null ? `S/ ${guia.total.toFixed(2)}` : "—"}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-5">
          <div className="space-y-1">
            <Label>Método de pago *</Label>
            <Select
              value={watch("metodoPago")}
              onValueChange={(v) => setValue("metodoPago", v as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                <SelectItem value="YAPE">Yape</SelectItem>
                <SelectItem value="PLIN">Plin</SelectItem>
                <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                <SelectItem value="TARJETA">Tarjeta</SelectItem>
                <SelectItem value="OTRO">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>N° de operación</Label>
            <Input
              {...register("numeroOperacion")}
              value={watch("numeroOperacion") ?? ""}
              onChange={(e) =>
                setValue("numeroOperacion", e.target.value || null)
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Fecha de pago *</Label>
              <Input type="date" {...register("fechaPago")} />
              {errors.fechaPago && (
                <p className="text-xs text-destructive">
                  {errors.fechaPago.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Hora de pago *</Label>
              <Input type="time" {...register("horaPago")} />
              {errors.horaPago && (
                <p className="text-xs text-destructive">
                  {errors.horaPago.message}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-md bg-muted p-3 text-sm">
            Al confirmar, el estado de pago se marcará como{" "}
            <span className="font-semibold">PAGADO</span>.
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Registrando..." : "Confirmar pago"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
