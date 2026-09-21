// modules\trasegados\components\asignar-cliente\asignar-cliente-modal.tsx

"use client"

import { Loader2Icon } from "lucide-react"
import { useEffect } from "react"
import { FormProvider } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { FormAsignarCliente } from "./form-asignar-cliente"
import { useAsignarCliente } from "../../hooks/use-asignar-cliente"

interface AsignarClienteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guiaId: number
  numeroGuia: string
  onSuccess?: () => void
}

export function AsignarClienteModal({
  open,
  onOpenChange,
  guiaId,
  numeroGuia,
  onSuccess,
}: AsignarClienteModalProps) {
  const {
    form,
    onSubmit,
    isPending,
    buscando,
    clienteEncontrado,
    buscarPorDocumento,
    limpiarBusqueda,
    resetForm,
  } = useAsignarCliente({
    guiaId,
    onSuccess: () => {
      onSuccess?.()
      onOpenChange(false)
    },
  })

  useEffect(() => {
    if (!open) return
    resetForm()
  }, [open, guiaId, resetForm])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Asignar cliente</DialogTitle>
          <DialogDescription>
            Asigna un cliente a la guía{" "}
            <span className="font-mono font-medium">{numeroGuia}</span>. Puedes
            buscarlo por número de documento o registrar uno nuevo.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={onSubmit} className="space-y-6">
            <FormAsignarCliente
              form={form}
              buscando={buscando}
              clienteEncontrado={clienteEncontrado}
              onBuscar={buscarPorDocumento}
              onLimpiarBusqueda={limpiarBusqueda}
            />

            <DialogFooter className="gap-2">
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
                  "Asignar cliente"
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
