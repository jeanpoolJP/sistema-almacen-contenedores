// modules/guias/components/list/guias-dialogs.tsx

"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { GuiaDetalleSheet } from "../guia-detalle-sheet"
import { RegistrarSalidaDialog } from "../registrar-salida-dialog"
import { RegistrarPagoDialog } from "../registrar-pago-dialog"

import type { GuiaConRelaciones } from "../guia-con-relaciones.type"

type GuiasDialogsProps = {
  guiaDetalle: GuiaConRelaciones | null
  setGuiaDetalle: (guia: GuiaConRelaciones | null) => void

  guiaSalida: GuiaConRelaciones | null
  setGuiaSalida: (guia: GuiaConRelaciones | null) => void

  guiaPago: GuiaConRelaciones | null
  setGuiaPago: (guia: GuiaConRelaciones | null) => void

  guiaAnular: GuiaConRelaciones | null
  setGuiaAnular: (guia: GuiaConRelaciones | null) => void

  anulando: boolean
  onConfirmarAnulacion: () => void
  onRefrescar: () => void
}

export function GuiasDialogs({
  guiaDetalle,
  setGuiaDetalle,
  guiaSalida,
  setGuiaSalida,
  guiaPago,
  setGuiaPago,
  guiaAnular,
  setGuiaAnular,
  anulando,
  onConfirmarAnulacion,
  onRefrescar,
}: GuiasDialogsProps) {
  return (
    <>
      {/* DETALLE */}
      <GuiaDetalleSheet
        guia={guiaDetalle}
        open={!!guiaDetalle}
        onOpenChange={(open) => !open && setGuiaDetalle(null)}
      />

      {/* SALIDA */}
      {guiaSalida && (
        <RegistrarSalidaDialog
          guia={guiaSalida}
          open={!!guiaSalida}
          onOpenChange={(open) => !open && setGuiaSalida(null)}
          onRegistrada={() => {
            setGuiaSalida(null)
            onRefrescar()
          }}
        />
      )}

      {/* PAGO */}
      {guiaPago && (
        <RegistrarPagoDialog
          guia={guiaPago}
          open={!!guiaPago}
          onOpenChange={(open) => !open && setGuiaPago(null)}
          onRegistrado={() => {
            setGuiaPago(null)
            onRefrescar()
          }}
        />
      )}

      {/* ANULAR */}
      <AlertDialog
        open={!!guiaAnular}
        onOpenChange={(open) => !open && setGuiaAnular(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Anular la guía {guiaAnular?.numeroGuia}?
            </AlertDialogTitle>

            <AlertDialogDescription>
              Esta acción no elimina el registro, pero marca la guía como
              anulada y no podrá revertirse desde aquí.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>

            <AlertDialogAction
              disabled={anulando}
              onClick={onConfirmarAnulacion}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              {anulando ? "Anulando..." : "Sí, anular"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}