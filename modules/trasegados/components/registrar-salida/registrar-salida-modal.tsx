// modules\trasegados\components\registrar-salida\registrar-salida-modal.tsx

"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { RegistrarSalidaForm } from "./registrar-salida-form"
import { useRegistrarSalida } from "../../hooks/use-registrar-salida"

interface RegistrarSalidaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guiaId: number
  numeroGuia: string
  onSuccess?: () => void
}

export function RegistrarSalidaModal({
  open,
  onOpenChange,
  guiaId,
  numeroGuia,
  onSuccess,
}: RegistrarSalidaModalProps) {
  const {
    form,
    onSubmit,
    isPending,
    elementos,
    cargandoElementos,
    elementosSeleccionados,
    toggleElemento,
    seleccionarTodos,
    limpiarSeleccion,
  } = useRegistrarSalida({
    guiaId,
    open,
    onSuccess: () => {
      onSuccess?.()
      onOpenChange(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Registrar salida</DialogTitle>
          <DialogDescription>
            Registra el retiro de elementos de la guía{" "}
            <span className="font-mono font-medium">{numeroGuia}</span>.
          </DialogDescription>
        </DialogHeader>

        <RegistrarSalidaForm
          form={form}
          onSubmit={onSubmit}
          isPending={isPending}
          elementos={elementos}
          cargandoElementos={cargandoElementos}
          elementosSeleccionados={elementosSeleccionados}
          onToggleElemento={toggleElemento}
          onSeleccionarTodos={seleccionarTodos}
          onLimpiarSeleccion={limpiarSeleccion}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}