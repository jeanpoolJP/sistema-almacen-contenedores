// modules\trasegados\components\registrar-pago\registrar-pago-modal.tsx

"use client"

import { Loader2Icon } from "lucide-react"

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
  const { form, onSubmit, isPending, cargandoEstado, esEdicion, totales } =
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
              : " Ingresa el monto y los datos del pago."}
          </DialogDescription>
        </DialogHeader>

        {cargandoEstado ? (
          <div className="flex items-center justify-center py-12">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <RegistrarPagoForm
            form={form}
            onSubmit={onSubmit}
            isPending={isPending}
            totales={totales}
            esEdicion={esEdicion}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
