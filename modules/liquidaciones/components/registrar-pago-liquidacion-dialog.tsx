"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CreditCard, LoaderCircle } from "lucide-react"
import { formatInTimeZone } from "date-fns-tz"
import type { MetodoPago } from "@/lib/generated/prisma"
import { APP_TIMEZONE } from "@/lib/date/constants"
import { createLimaDate } from "@/lib/date/create"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogDescription,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { registrarPagoLiquidacionAction } from "../liquidacion.actions"

const metodosPago: { value: MetodoPago; label: string }[] = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "YAPE", label: "Yape" },
  { value: "PLIN", label: "Plin" },
  { value: "TRANSFERENCIA", label: "Transferencia bancaria" },
  { value: "TARJETA", label: "Tarjeta" },
  { value: "OTRO", label: "Otro" },
]

type RegistrarPagoLiquidacionDialogProps = {
  liquidacionId: number
  numero: string
  montoTotal: number
}

function formatMoneda(valor: number) {
  return `S/ ${valor.toFixed(2)}`
}

export function RegistrarPagoLiquidacionDialog({
  liquidacionId,
  numero,
  montoTotal,
}: RegistrarPagoLiquidacionDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("EFECTIVO")
  const [numeroOperacion, setNumeroOperacion] = useState("")
  const [fechaPago, setFechaPago] = useState(() =>
    formatInTimeZone(new Date(), APP_TIMEZONE, "yyyy-MM-dd'T'HH:mm")
  )

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const [fecha, hora] = fechaPago.split("T")
    if (!fecha || !hora) {
      toast.error("Ingresa una fecha y hora válidas.")
      return
    }

    setGuardando(true)
    try {
      const resultado = await registrarPagoLiquidacionAction({
        liquidacionId,
        metodoPago,
        numeroOperacion: numeroOperacion.trim(),
        fechaPago: createLimaDate(fecha, hora),
      })

      if (!resultado.ok) {
        toast.error(resultado.error.message)
        return
      }

      toast.success("El pago se registró correctamente.")
      setOpen(false)
      router.refresh()
    } catch {
      toast.error("No se pudo registrar el pago. Inténtalo nuevamente.")
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <CreditCard />
            Registrar pago
          </Button>
        }
      />
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="border-b px-6 py-5 pr-12">
          <DialogTitle className="text-lg">Registrar pago</DialogTitle>
          <DialogDescription>
            Ingresa los datos del pago para cerrar esta liquidación.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/40 px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                Liquidación
              </p>
              <p className="truncate font-mono text-sm font-semibold">
                {numero}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs font-medium text-muted-foreground">
                Total a pagar
              </p>
              <p className="text-lg font-semibold tabular-nums">
                {formatMoneda(montoTotal)}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="metodo-pago">Método de pago</Label>
              <select
                id="metodo-pago"
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={metodoPago}
                onChange={(event) =>
                  setMetodoPago(event.target.value as MetodoPago)
                }
                disabled={guardando}
              >
                {metodosPago.map((metodo) => (
                  <option key={metodo.value} value={metodo.value}>
                    {metodo.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero-operacion">Número de operación</Label>
              <Input
                id="numero-operacion"
                value={numeroOperacion}
                onChange={(event) => setNumeroOperacion(event.target.value)}
                placeholder="Ingresa el número o código de operación"
                maxLength={100}
                autoComplete="off"
                required
                disabled={guardando}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha-pago">Fecha y hora del pago</Label>
              <Input
                id="fecha-pago"
                type="datetime-local"
                value={fechaPago}
                onChange={(event) => setFechaPago(event.target.value)}
                required
                disabled={guardando}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={guardando}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <CreditCard />
              )}
              {guardando ? "Registrando pago..." : "Confirmar pago"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
