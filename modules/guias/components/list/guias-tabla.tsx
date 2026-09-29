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
import { formatHoraNegocio } from "./guias-utils"

type GuiasTablaProps = {
  guias: GuiaConRelaciones[]
  onVerDetalle: (guia: GuiaConRelaciones) => void
  onEditarIngreso: (guia: GuiaConRelaciones) => void
  onRegistrarSalida: (guia: GuiaConRelaciones) => void
  onAnularSalida: (guia: GuiaConRelaciones) => void
  onRegistrarPago: (guia: GuiaConRelaciones) => void
  onAnular: (guia: GuiaConRelaciones) => void
  onCambio: () => void
}

export function GuiasTabla({
  guias,
  onVerDetalle,
  onEditarIngreso,
  onRegistrarSalida,
  onAnularSalida,
  onRegistrarPago,
  onAnular,
  onCambio,
}: GuiasTablaProps) {
  return (
    // 1. Permitimos scroll horizontal (overflow-x-auto) solo cuando sea necesario en móviles
    <div className="w-full overflow-x-auto rounded-lg border">
      {/* 2. Establecemos min-w-[850px] en móvil para proteger las columnas, 
             y lg:min-w-full lg:table-fixed para laptops/desktops */}
      <Table className="w-full min-w-[850px] lg:table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[85px] lg:w-[8%]">N° Guía</TableHead>
            <TableHead className="w-[180px] lg:w-[18%]">Cliente</TableHead>
            <TableHead className="w-[150px] lg:w-[15%]">Contenedor</TableHead>
            <TableHead className="w-[110px] lg:w-[11%]">Ingreso</TableHead>
            <TableHead className="w-[110px] lg:w-[11%]">Salida</TableHead>
            <TableHead className="w-[100px] lg:w-[10%]">Estado</TableHead>
            <TableHead className="w-[110px] lg:w-[11%]">Pago</TableHead>
            <TableHead className="w-[110px] text-right lg:w-[11%]">
              Monto
            </TableHead>
            <TableHead className="w-[50px] lg:w-[5%]" />
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
              <TableCell className="truncate font-medium">
                {guia.numeroGuia}
              </TableCell>

              <TableCell className="min-w-0">
                {guia.cliente ? (
                  <div className="min-w-0">
                    <p
                      className="truncate text-sm"
                      title={guia.cliente.nombreCompleto || "Sin nombre"}
                    >
                      {guia.cliente.nombreCompleto || "Sin nombre"}
                    </p>

                    <p className="truncate text-xs text-muted-foreground">
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

              <TableCell className="min-w-0">
                <div className="min-w-0">
                  <p
                    className="truncate text-sm font-medium"
                    title={guia.contenedor.numeroContenedor}
                  >
                    {guia.contenedor.numeroContenedor}
                  </p>

                  <div className="flex min-w-0 items-center gap-1.5">
                    <p
                      className="truncate text-xs text-muted-foreground"
                      title={guia.contenedor.marca}
                    >
                      {guia.contenedor.marca}
                    </p>

                    <Badge
                      variant="outline"
                      className="shrink-0 px-1.5 py-0 text-[11px]"
                    >
                      {guia.contenedor.medida}
                    </Badge>
                  </div>
                </div>
              </TableCell>

              <TableCell className="text-sm whitespace-nowrap">
                {guia.fechaIngreso ? (
                  <div>
                    <p>{formatFechaNegocio(guia.fechaIngreso)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatHoraNegocio(guia.horaIngreso)}
                    </p>
                  </div>
                ) : (
                  "—"
                )}
              </TableCell>

              <TableCell className="text-sm whitespace-nowrap">
                {guia.fechaSalida ? (
                  <div>
                    <p>{formatFechaNegocio(guia.fechaSalida)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatHoraNegocio(guia.horaSalida)}
                    </p>
                  </div>
                ) : (
                  "—"
                )}
              </TableCell>

              <TableCell>
                <EstadoBadge estado={guia.estado} />
              </TableCell>

              <TableCell>
                <EstadoPagoBadge estado={guia.estadoPago} />
              </TableCell>

              <TableCell className="text-right text-sm whitespace-nowrap">
                {guia.montoTotal !== null
                  ? `S/ ${guia.montoTotal.toFixed(2)}`
                  : "—"}
              </TableCell>

              <TableCell>
                <GuiasAccionesMenu
                  guia={guia}
                  onVerDetalle={onVerDetalle}
                  onEditarIngreso={onEditarIngreso}
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
