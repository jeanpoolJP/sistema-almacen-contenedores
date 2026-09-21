// modules\trasegados\components\finalizar-guia\finalizar-guia-modal.tsx

"use client"

import { CheckCircle2Icon, Loader2Icon, RotateCcwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { PendientesLista } from "./pendientes-lista"
import { useFinalizarGuia } from "../../hooks/use-finalizar-guia"

interface FinalizarGuiaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guiaId: number
  numeroGuia: string
  finalizar: boolean
  onSuccess?: () => void
}

export function FinalizarGuiaModal({
  open,
  onOpenChange,
  guiaId,
  numeroGuia,
  finalizar,
  onSuccess,
}: FinalizarGuiaModalProps) {
  const {
    pendientes,
    cargandoPendientes,
    isPending,
    confirmar,
    puedeFinalizar,
  } = useFinalizarGuia({
    guiaId,
    open,
    finalizar,
    onSuccess: () => {
      onSuccess?.()
      onOpenChange(false)
    },
  })

  const esReactivar = !finalizar

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {esReactivar ? (
              <>
                <RotateCcwIcon className="size-5 text-amber-600" />
                Reactivar guía
              </>
            ) : (
              <>
                <CheckCircle2Icon className="size-5 text-emerald-600" />
                Finalizar guía
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {esReactivar ? (
              <>
                Vas a reactivar la guía{" "}
                <span className="font-mono font-medium">{numeroGuia}</span>. Se
                podrán registrar nuevas salidas.
              </>
            ) : (
              <>
                Vas a finalizar la guía{" "}
                <span className="font-mono font-medium">{numeroGuia}</span>. Una
                vez finalizada no se podrán registrar nuevas salidas.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {!esReactivar && (
          <div className="py-2">
            {cargandoPendientes ? (
              <div className="flex items-center justify-center py-6">
                <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <PendientesLista pendientes={pendientes} />
            )}

            {puedeFinalizar && !cargandoPendientes && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                ✓ Todos los elementos han sido retirados o marcados como
                completados. Puedes finalizar la guía.
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant={esReactivar ? "default" : "default"}
            disabled={
              isPending ||
              (!esReactivar && (!puedeFinalizar || cargandoPendientes))
            }
            onClick={confirmar}
          >
            {isPending ? (
              <>
                <Loader2Icon className="mr-2 size-4 animate-spin" />
                Procesando...
              </>
            ) : esReactivar ? (
              "Reactivar guía"
            ) : (
              "Finalizar guía"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
