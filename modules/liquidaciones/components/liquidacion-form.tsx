// modules\liquidaciones\components\liquidacion-form.tsx

"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  createLiquidacionAction,
  getGuiasDisponiblesAction,
  updateLiquidacionDetallesAction,
} from "../liquidacion.actions"
import type { GuiaDisponible } from "../liquidacion.types"
import { runAction } from "../hooks/use-action-result"
import { toast } from "sonner"
import { LiquidacionBackButton } from "./liquidacion-back-button"

type Cliente = {
  id: number
  nombreCompleto: string | null
  numeroDocumento: string
}

export function LiquidacionForm({ clientes }: { clientes: Cliente[] }) {
  const router = useRouter()
  const [clienteId, setClienteId] = useState<number | "">("")
  const [fechaCorte, setFechaCorte] = useState(
    new Date().toISOString().slice(0, 10)
  )
  const [guias, setGuias] = useState<GuiaDisponible[]>([])
  const [seleccion, setSeleccion] = useState<Set<number>>(new Set())
  const [loadingGuias, setLoadingGuias] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!clienteId) {
      setGuias([])
      setSeleccion(new Set())
      return
    }
    let cancelled = false
    setLoadingGuias(true)
    runAction(() => getGuiasDisponiblesAction(Number(clienteId)))
      .then((data) => {
        if (cancelled || !data) return
        setGuias(data)
        setSeleccion(new Set(data.map((g) => g.id)))
      })
      .finally(() => {
        if (!cancelled) setLoadingGuias(false)
      })
    return () => {
      cancelled = true
    }
  }, [clienteId])

  const totales = useMemo(() => {
    const sel = guias.filter((g) => seleccion.has(g.id))
    const subtotal = sel.reduce((a, g) => a + g.montoTotal, 0)
    return { subtotal, total: subtotal, count: sel.length }
  }, [guias, seleccion])

  function toggle(id: number) {
    setSeleccion((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleCrear() {
    if (!clienteId) {
      toast.error("Seleccione un cliente")
      return
    }
    if (seleccion.size === 0) {
      toast.error("Seleccione al menos una guía")
      return
    }

    setSaving(true)
    try {
      const liq = await runAction(
        () =>
          createLiquidacionAction({
            clienteId: Number(clienteId),
            fechaCorte: new Date(fechaCorte),
          }),
        { successMessage: "Borrador creado" }
      )
      if (!liq) return

      const updated = await runAction(() =>
        updateLiquidacionDetallesAction({
          liquidacionId: liq.id,
          guiaIds: Array.from(seleccion),
        })
      )
      if (!updated) return

      router.push(`/admin/liquidaciones/${liq.id}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <LiquidacionBackButton />

      <h1 className="text-2xl font-bold">Nueva liquidación</h1>

      <Card>
        <CardHeader>
          <CardTitle>Datos generales</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label>Cliente</Label>
            <select
              className="w-full rounded border px-3 py-2"
              value={clienteId}
              onChange={(e) => setClienteId(Number(e.target.value) || "")}
            >
              <option value="">-- Seleccionar --</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombreCompleto ?? "Sin nombre"} - {c.numeroDocumento}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Fecha de corte</Label>
            <Input
              type="date"
              value={fechaCorte}
              onChange={(e) => setFechaCorte(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Guías disponibles ({guias.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingGuias ? (
            <p>Cargando guías...</p>
          ) : guias.length === 0 ? (
            <p className="text-muted-foreground">
              No hay guías pendientes para este cliente.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead />
                  <TableHead>N° Guía</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Contenedor</TableHead>
                  <TableHead>Medida</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Ingreso</TableHead>
                  <TableHead>Salida</TableHead>
                  <TableHead className="text-right">P. Ing/Sal</TableHead>
                  <TableHead className="text-right">Movs</TableHead>
                  <TableHead className="text-right">Subtotal movs</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guias.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell>
                      <Checkbox
                        checked={seleccion.has(g.id)}
                        onCheckedChange={() => toggle(g.id)}
                      />
                    </TableCell>
                    <TableCell className="font-mono">{g.numeroGuia}</TableCell>
                    <TableCell>{g.marcaContenedor}</TableCell>
                    <TableCell>{g.numeroContenedor}</TableCell>
                    <TableCell>{g.medidaContenedor}</TableCell>
                    <TableCell>{g.tipoContenedor}</TableCell>
                    <TableCell>
                      {new Date(g.fechaIngreso).toLocaleDateString("es-PE")}
                    </TableCell>
                    <TableCell>
                      {g.fechaSalida
                        ? new Date(g.fechaSalida).toLocaleDateString("es-PE")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {g.precioIngresoSalida?.toFixed(2) ?? "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {g.cantidadMovimientos ?? "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {g.subtotalMovimientos?.toFixed(2) ?? "-"}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      S/ {g.montoTotal.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between pt-6">
          <div>
            <p className="text-sm text-muted-foreground">
              Guías seleccionadas: {totales.count}
            </p>
            <p className="text-2xl font-bold">
              Total: S/ {totales.total.toFixed(2)}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/liquidaciones")}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCrear}
            disabled={saving || totales.count === 0}
          >
            {saving ? "Creando..." : "Crear liquidación (borrador)"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
