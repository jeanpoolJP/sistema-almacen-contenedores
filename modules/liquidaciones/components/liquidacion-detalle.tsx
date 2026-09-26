// modules\liquidaciones\components\liquidacion-detalle.tsx

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  confirmarLiquidacionAction,
  registrarPagoLiquidacionAction,
} from "../liquidacion.actions"
import type { LiquidacionDetalle } from "../liquidacion.types"
import { exportLiquidacionToPDF } from "../utils/pdf"
import { exportLiquidacionToExcel } from "../utils/excel"
import { LiquidacionBackButton } from "./liquidacion-back-button"

export function LiquidacionDetalleView({
  liquidacion,
}: {
  liquidacion: LiquidacionDetalle
}) {
  const [openPago, setOpenPago] = useState(false)
  const [metodoPago, setMetodoPago] = useState("EFECTIVO")
  const [numeroOperacion, setNumeroOperacion] = useState("")
  const [fechaPago, setFechaPago] = useState(
    new Date().toISOString().slice(0, 16)
  )

  async function handleConfirmar() {
    await confirmarLiquidacionAction({ liquidacionId: liquidacion.id })
    location.reload()
  }

  async function handlePagar() {
    await registrarPagoLiquidacionAction({
      liquidacionId: liquidacion.id,
      metodoPago: metodoPago as any,
      numeroOperacion,
      fechaPago: new Date(fechaPago),
    })
    setOpenPago(false)
    location.reload()
  }

  return (
    <div className="space-y-6 p-6">
      <LiquidacionBackButton />
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Liquidación {liquidacion.numero}
          </h1>
          <p className="text-muted-foreground">
            {liquidacion.clienteNombre} - {liquidacion.clienteDocumento}
          </p>
          <p className="text-sm">
            Fecha de corte:{" "}
            {new Date(liquidacion.fechaCorte).toLocaleDateString("es-PE")}
          </p>
        </div>
        <Badge>{liquidacion.estado}</Badge>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => exportLiquidacionToPDF(liquidacion)}
        >
          Exportar PDF
        </Button>
        <Button
          variant="outline"
          onClick={() => exportLiquidacionToExcel(liquidacion)}
        >
          Exportar Excel
        </Button>

        {liquidacion.estado === "BORRADOR" && (
          <Button onClick={handleConfirmar}>Confirmar</Button>
        )}

        {liquidacion.estado === "CONFIRMADA" && (
          <Dialog open={openPago} onOpenChange={setOpenPago}>
            <DialogTrigger render={<Button>Registrar pago</Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar pago</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Método de pago</Label>
                  <select
                    className="w-full rounded border px-3 py-2"
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                  >
                    {[
                      "EFECTIVO",
                      "YAPE",
                      "PLIN",
                      "TRANSFERENCIA",
                      "TARJETA",
                      "OTRO",
                    ].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Número de operación</Label>
                  <Input
                    value={numeroOperacion}
                    onChange={(e) => setNumeroOperacion(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Fecha y hora</Label>
                  <Input
                    type="datetime-local"
                    value={fechaPago}
                    onChange={(e) => setFechaPago(e.target.value)}
                  />
                </div>
                <Button onClick={handlePagar} className="w-full">
                  Confirmar pago
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalle de guías</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Guía</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>N° Contenedor</TableHead>
                <TableHead>Medida</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>F. Ingreso</TableHead>
                <TableHead>F. Salida</TableHead>
                <TableHead className="text-right">P. Ing/Sal</TableHead>
                <TableHead className="text-right">Movs</TableHead>
                <TableHead className="text-right">Subtotal movs</TableHead>
                <TableHead className="text-right">Monto guía</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {liquidacion.detalles.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono">{d.numeroGuia}</TableCell>
                  <TableCell>{d.marcaContenedor}</TableCell>
                  <TableCell>{d.numeroContenedor}</TableCell>
                  <TableCell>{d.medidaContenedor}</TableCell>
                  <TableCell>{d.tipoContenedor}</TableCell>
                  <TableCell>
                    {new Date(d.fechaIngreso).toLocaleDateString("es-PE")}
                  </TableCell>
                  <TableCell>
                    {d.fechaSalida
                      ? new Date(d.fechaSalida).toLocaleDateString("es-PE")
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {d.precioIngresoSalida?.toFixed(2) ?? "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {d.cantidadMovimientos ?? "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {d.subtotalMovimientos?.toFixed(2) ?? "-"}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    S/ {d.montoTotalGuia.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-1 pt-6 text-right">
          <p>Subtotal: S/ {liquidacion.subtotal.toFixed(2)}</p>
          <p>
            IGV ({liquidacion.porcentajeIGV}%): S/{" "}
            {liquidacion.montoIGV.toFixed(2)}
          </p>
          <p className="text-2xl font-bold">
            Total: S/ {liquidacion.montoTotal.toFixed(2)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
