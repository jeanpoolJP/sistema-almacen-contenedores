"use client"

import { FileSpreadsheet, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { exportarExcel } from "@/lib/exportar-excel"

type Inventario = {
  id: number
  fecha: Date
  estado: "EN_PROCESO" | "FINALIZADO"
  observaciones: string | null
  _count: {
    detalles: number
  }
}

type InventarioTableProps = {
  inventarios: Inventario[]
  onNuevo?: () => void
  onVer?: (id: number) => void
}

function formatearFecha(fecha: Date) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(fecha))
}

function obtenerEstadoBadge(estado: Inventario["estado"]) {
  if (estado === "FINALIZADO") {
    return <Badge variant="default">Finalizado</Badge>
  }

  return <Badge variant="secondary">En proceso</Badge>
}

export function InventarioTable({
  inventarios,
  onNuevo,
  onVer,
}: InventarioTableProps) {
  function exportar() {
    const datos = inventarios.map((inventario) => ({
      ID: inventario.id,
      Fecha: formatearFecha(inventario.fecha),
      Estado: inventario.estado === "FINALIZADO" ? "Finalizado" : "En proceso",
      "Cantidad de contenedores": inventario._count.detalles,
      Observaciones: inventario.observaciones ?? "",
    }))

    exportarExcel({
      datos,
      nombreArchivo: "inventarios",
      nombreHoja: "Inventarios",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Inventarios</h2>

          <p className="text-sm text-muted-foreground">
            Control y verificación física de los contenedores almacenados.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={exportar}
            disabled={inventarios.length === 0}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>

          <Button onClick={onNuevo}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo inventario
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Contenedores</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Observaciones</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {inventarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No hay inventarios registrados.
                </TableCell>
              </TableRow>
            ) : (
              inventarios.map((inventario) => (
                <TableRow key={inventario.id}>
                  <TableCell className="font-medium">
                    #{inventario.id}
                  </TableCell>

                  <TableCell>{formatearFecha(inventario.fecha)}</TableCell>

                  <TableCell>{inventario._count.detalles}</TableCell>

                  <TableCell>{obtenerEstadoBadge(inventario.estado)}</TableCell>

                  <TableCell className="max-w-[250px] truncate">
                    {inventario.observaciones || "—"}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onVer?.(inventario.id)}
                    >
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
