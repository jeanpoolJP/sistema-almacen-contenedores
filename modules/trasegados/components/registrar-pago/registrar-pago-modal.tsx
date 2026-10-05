// modules\trasegados\components\registrar-pago\registrar-pago-modal.tsx

"use client"

import { Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { RegistrarPagoForm } from "./registrar-pago-form"
import { useRegistrarPago } from "../../hooks/use-registrar-pago"

interface RegistrarPagoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guiaId: number
  numeroGuia: string
  onSuccess?: () => void
}

export function RegistrarPagoModal({
  open,
  onOpenChange,
  guiaId,
  numeroGuia,
  onSuccess,
}: RegistrarPagoModalProps) {
  const { form, onSubmit, isPending, cargandoEstado, esEdicion, cotizacion } =
    useRegistrarPago({
      guiaId,
      open,
      onSuccess: () => {
        onSuccess?.()
        onOpenChange(false)
      },
    })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {esEdicion ? "Actualizar pago" : "Registrar pago"}
          </DialogTitle>
          <DialogDescription>
            Guía <span className="font-mono font-medium">{numeroGuia}</span>.
            {esEdicion
              ? " Ya tiene un pago registrado. Los cambios lo actualizarán."
              : " Registra el pago correspondiente a la cotización asignada."}
          </DialogDescription>
        </DialogHeader>

        {cargandoEstado ? (
          <div className="flex items-center justify-center py-12">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : cotizacion ? (
          <RegistrarPagoForm
            form={form}
            onSubmit={onSubmit}
            isPending={isPending}
            cotizacion={cotizacion}
            esEdicion={esEdicion}
            onCancel={() => onOpenChange(false)}
          />
        ) : (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Esta guía todavía no tiene una cotización asignada.
            </p>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
