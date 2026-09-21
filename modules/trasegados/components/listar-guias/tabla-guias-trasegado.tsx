// modules\trasegados\components\listar-guias\tabla-guias-trasegado.tsx

"use client"

import {
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUpDownIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDateTime } from "@/lib/date/format"

import { AccionesGuiaMenu } from "./acciones-guia-menu"
import { EstadoBadge, EstadoPagoBadge } from "./estado-badge"
import type { ListarGuiasTrasegadoResult } from "../../types/guia-trasegado-listado.types"
import type { ListarGuiasTrasegadoInput } from "../../schemas/listar-guias-trasegado.schema"

interface TablaGuiasTrasegadoProps {
  result: ListarGuiasTrasegadoResult | null
  isLoading: boolean
  onVerDetalle: (id: number) => void
  onAsignarCliente: (id: number, numeroGuia: string) => void
  onIrAPagina: (page: number) => void
  onCambiarOrden: (ordenarPor: ListarGuiasTrasegadoInput["ordenarPor"]) => void
  ordenActual: ListarGuiasTrasegadoInput["ordenarPor"]
}

export function TablaGuiasTrasegado({
  result,
  isLoading,
  onVerDetalle,
  onAsignarCliente,
  onIrAPagina,
  onCambiarOrden,
  ordenActual,
}: TablaGuiasTrasegadoProps) {
  if (isLoading || !result) {
    return <TablaSkeleton />
  }

  if (result.items.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <p className="text-sm font-medium">No se encontraron guías</p>
        <p className="text-xs text-muted-foreground">
          Ajusta los filtros para ver resultados.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  type="button"
                  onClick={() => onCambiarOrden("numeroGuia")}
                  className="inline-flex items-center gap-1 font-medium hover:text-foreground"
                >
                  N° Guía
                  {ordenActual === "numeroGuia" && (
                    <ArrowUpDownIcon className="size-3" />
                  )}
                </button>
              </TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => onCambiarOrden("fechaIngreso")}
                  className="inline-flex items-center gap-1 font-medium hover:text-foreground"
                >
                  Ingreso
                  {ordenActual === "fechaIngreso" && (
                    <ArrowUpDownIcon className="size-3" />
                  )}
                </button>
              </TableHead>
              <TableHead className="text-center">Elementos</TableHead>
              <TableHead className="text-center">Salidas</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Pago</TableHead>
              <TableHead className="text-right">
                <button
                  type="button"
                  onClick={() => onCambiarOrden("totalPagar")}
                  className="inline-flex items-center gap-1 font-medium hover:text-foreground"
                >
                  Total
                  {ordenActual === "totalPagar" && (
                    <ArrowUpDownIcon className="size-3" />
                  )}
                </button>
              </TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.map((g) => (
              <TableRow key={g.id}>
                <TableCell className="text-xs font-medium">
                  {g.numeroGuia}
                </TableCell>
                <TableCell>
                  {g.cliente ? (
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {g.cliente.nombreCompleto ?? "—"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {g.cliente.tipoDocumento}: {g.cliente.numeroDocumento}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Sin cliente
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {formatDateTime(g.fechaIngreso)}
                </TableCell>
                <TableCell className="text-center text-sm">
                  {g.totalElementos}
                </TableCell>
                <TableCell className="text-center text-sm">
                  {g.totalSalidas}
                </TableCell>
                <TableCell>
                  <EstadoBadge estado={g.estado} />
                </TableCell>
                <TableCell>
                  <EstadoPagoBadge estadoPago={g.estadoPago} />
                </TableCell>
                <TableCell className="text-right text-sm tabular-nums">
                  {g.totalPagar != null ? `S/ ${g.totalPagar.toFixed(2)}` : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <AccionesGuiaMenu
                    onVerDetalle={() => onVerDetalle(g.id)}
                    onAsignarCliente={() =>
                      onAsignarCliente(g.id, g.numeroGuia)
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Mostrando {result.items.length} de {result.total} guías
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={result.page <= 1}
            onClick={() => onIrAPagina(result.page - 1)}
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <span className="text-sm">
            Página {result.page} de {result.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={result.page >= result.totalPages}
            onClick={() => onIrAPagina(result.page + 1)}
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function TablaSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  )
}
