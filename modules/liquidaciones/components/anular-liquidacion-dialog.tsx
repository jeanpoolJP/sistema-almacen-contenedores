// modules\liquidaciones\components\anular-liquidacion-dialog.tsx

"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  FileText,
  Loader2,
  RotateCcw,
  ShieldAlert,
  Wallet,
} from "lucide-react"

import { anularLiquidacionAction } from "../liquidacion.actions"
import type { LiquidacionDetalle } from "../liquidacion.types"

interface Props {
  liquidacion: Pick<
    LiquidacionDetalle,
    | "id"
    | "numero"
    | "clienteNombre"
    | "cantidadGuias"
    | "montoTotal"
    | "estado"
  >
}

function formatMoneda(valor: number) {
  return `S/ ${valor.toFixed(2)}`
}

export function AnularLiquidacionDialog({ liquidacion }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAnular() {
    if (loading) return

    setLoading(true)
    setError(null)

    try {
      const result = await anularLiquidacionAction(liquidacion.id)

      if (!result.ok) {
        setError("No se pudo anular la liquidación. Inténtalo nuevamente.")
        return
      }

      setOpen(false)
      window.location.reload()
    } catch {
      setError("Ocurrió un error inesperado. Inténtalo nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(value) => {
        if (!loading) {
          setOpen(value)
          if (!value) setError(null)
        }
      }}
    >
      <AlertDialogTrigger className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-destructive shadow-xs transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-50">
        <ShieldAlert className="h-4 w-4" />
        Anular liquidación
      </AlertDialogTrigger>

      <AlertDialogContent className="w-[calc(100%-2rem)] !max-w-3xl sm:!max-w-3xl">
        <AlertDialogHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>

          <AlertDialogTitle className="text-xl">
            ¿Anular esta liquidación?
          </AlertDialogTitle>

          <AlertDialogDescription>
            Estás a punto de anular una liquidación. Revisa la información antes
            de continuar.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Información de la liquidación */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Liquidación
                </p>
                <p className="mt-1 font-mono text-sm font-semibold break-all">
                  {liquidacion.numero}
                </p>
              </div>

              <Badge variant="outline" className="shrink-0">
                {liquidacion.estado}
              </Badge>
            </div>

            <div className="mt-4 border-t pt-3">
              <p className="text-xs text-muted-foreground">Cliente</p>
              <p className="mt-1 text-sm font-medium">
                {liquidacion.clienteNombre}
              </p>
            </div>
          </div>

          {/* Resumen económico */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span className="text-xs">Guías incluidas</span>
              </div>
              <p className="mt-2 text-xl font-semibold tabular-nums">
                {liquidacion.cantidadGuias}
              </p>
            </div>

            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Wallet className="h-4 w-4" />
                <span className="text-xs">Monto total</span>
              </div>
              <p className="mt-2 text-xl font-semibold tabular-nums">
                {formatMoneda(liquidacion.montoTotal)}
              </p>
            </div>
          </div>

          {/* Consecuencias */}
          <div className="space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-amber-600" />
              <p className="text-sm font-semibold">¿Qué sucederá después?</p>
            </div>

            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-amber-600">•</span>
                La liquidación cambiará al estado ANULADA.
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600">•</span>
                Las guías incluidas volverán a estar disponibles para otra
                liquidación.
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600">•</span>
                No podrás registrar un pago sobre esta liquidación.
              </li>
            </ul>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}
        </div>

        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>

          <Button
            variant="destructive"
            onClick={handleAnular}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Anulando...
              </>
            ) : (
              <>
                <ShieldAlert className="mr-2 h-4 w-4" />
                Sí, anular liquidación
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
