// modules/control-alquiler/components/asignar-cliente-sheet.tsx
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  asignarClienteSchema,
  type AsignarClienteFormData,
} from "../control-alquiler.schema"
import { asignarClienteAction } from "../control-alquiler.actions"

import type { GuiaAlquilerListItem } from "../control-alquiler.types"
import type { Cliente } from "@/modules/clientes/cliente.types"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  guia: GuiaAlquilerListItem
  clientes: Cliente[]
}

export function AsignarClienteSheet({
  open,
  onOpenChange,
  guia,
  clientes,
}: Props) {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AsignarClienteFormData>({
    resolver: zodResolver(asignarClienteSchema),
    defaultValues: {
      modo: "existente",
      clienteId: guia.cliente?.id ?? null,
      tipoDocumento: "DNI",
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        modo: "existente",
        clienteId: guia.cliente?.id ?? null,
        tipoDocumento: "DNI",
      })
    }
  }, [open, guia, reset])

  const modo = watch("modo")
  const clienteId = watch("clienteId")

  const onSubmit = (data: AsignarClienteFormData) => {
    startTransition(async () => {
      const res = await asignarClienteAction(guia.id, data)
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
          <DialogTitle>Asignar cliente</DialogTitle>
          <DialogDescription>
            Guía <span className="font-medium">{guia.numeroGuia}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-5">
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={modo === "existente"}
                onChange={() => setValue("modo", "existente")}
              />
              <span>Cliente existente</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={modo === "nuevo"}
                onChange={() => setValue("modo", "nuevo")}
              />
              <span>Cliente nuevo</span>
            </label>
          </div>

          {modo === "existente" ? (
            <div className="space-y-1">
              <Label>Cliente</Label>
              <Select
                value={clienteId ? String(clienteId) : ""}
                onValueChange={(v) => setValue("clienteId", Number(v))}
              >
                {/* w-full hace que ocupe todo el ancho del contenedor */}
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                {/* min-w-[...] expande la ventana flotante para que no corte los nombres largos */}
                <SelectContent className="min-w-[350px]">
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nombreCompleto ?? c.numeroDocumento}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clienteId && (
                <p className="text-xs text-destructive">
                  {errors.clienteId.message}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label>Tipo documento</Label>
                  <Select
                    value={watch("tipoDocumento")}
                    onValueChange={(v) => setValue("tipoDocumento", v as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DNI">DNI</SelectItem>
                      <SelectItem value="RUC">RUC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Número</Label>
                  <Input {...register("numeroDocumento")} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Nombre completo / Razón social</Label>
                <Input {...register("nombreCompleto")} />
              </div>
              <div className="space-y-1">
                <Label>Teléfono</Label>
                <Input {...register("telefono")} />
              </div>
              <div className="space-y-1">
                <Label>Observaciones</Label>
                <Textarea {...register("observaciones")} rows={2} />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Asignando..." : "Asignar cliente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
