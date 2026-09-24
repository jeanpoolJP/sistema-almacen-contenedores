// modules/guias/components/list/guias-tabla.tsx

"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

import { EstadoBadge } from "../estado-badge"
import { EstadoPagoBadge } from "../estado-pago-badge"

import type { GuiaConRelaciones } from "../guia-con-relaciones.type"

import { GuiasAccionesMenu } from "./guias-acciones-menu"
import { formatFechaNegocio } from "./guias-utils"

type GuiasTablaProps = {
  guias: GuiaConRelaciones[]
  onVerDetalle: (guia: GuiaConRelaciones) => void
  onRegistrarSalida: (guia: GuiaConRelaciones) => void
  onAnularSalida: (guia: GuiaConRelaciones) => void
  onRegistrarPago: (guia: GuiaConRelaciones) => void
  onAnular: (guia: GuiaConRelaciones) => void
  onCambio: () => void
}

export function GuiasTabla({
  guias,
  onVerDetalle,
  onRegistrarSalida,
  onAnularSalida,
  onRegistrarPago,
  onAnular,
  onCambio,
}: GuiasTablaProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>N° Guía</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Contenedor</TableHead>
            <TableHead>Ingreso</TableHead>
            <TableHead>Salida</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Estado de pago</TableHead>
            <TableHead className="text-right">Monto total</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {guias.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={9}
                className="h-24 text-center text-sm text-muted-foreground"
              >
                No se encontraron guías.
              </TableCell>
            </TableRow>
          )}

          {guias.map((guia) => (
            <TableRow key={guia.id}>
              <TableCell className="font-medium">{guia.numeroGuia}</TableCell>

              <TableCell>
                {guia.cliente ? (
                  <div>
                    <p className="text-sm">
                      {guia.cliente.nombreCompleto || "Sin nombre"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {guia.cliente.tipoDocumento}{" "}
                      {guia.cliente.numeroDocumento}
                    </p>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Sin cliente
                  </span>
                )}
              </TableCell>

              <TableCell>
                <div>
                  <p className="text-sm font-medium">
                    {guia.contenedor.numeroContenedor}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      {guia.contenedor.marca}
                    </p>
                    <Badge
                      variant="outline"
                      className="px-1.5 py-0 text-[11px]"
                    >
                      {guia.contenedor.medida}
                    </Badge>
                  </div>
                </div>
              </TableCell>

              <TableCell className="text-sm">
                {formatFechaNegocio(guia.fechaIngreso)}
              </TableCell>

              <TableCell className="text-sm">
                {formatFechaNegocio(guia.fechaSalida)}
              </TableCell>

              <TableCell>
                <EstadoBadge estado={guia.estado} />
              </TableCell>

              <TableCell>
                <EstadoPagoBadge estado={guia.estadoPago} />
              </TableCell>

              <TableCell className="text-right text-sm">
                {guia.montoTotal !== null
                  ? `S/ ${guia.montoTotal.toFixed(2)}`
                  : "—"}
              </TableCell>

              <TableCell>
                <GuiasAccionesMenu
                  guia={guia}
                  onVerDetalle={onVerDetalle}
                  onRegistrarSalida={onRegistrarSalida}
                  onAnularSalida={onAnularSalida}
                  onRegistrarPago={onRegistrarPago}
                  onAnular={onAnular}
                  onCambio={onCambio}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
