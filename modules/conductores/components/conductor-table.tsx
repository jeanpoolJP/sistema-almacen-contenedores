// modules\conductores\components\conductor-table.tsx

"use client"

import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  MoreHorizontal,
  Pencil,
  UserRound,
} from "lucide-react"

import type { Conductor } from "../conductores.types"

import { exportarExcel } from "@/lib/exportar-excel"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type ConductorTableProps = {
  conductores: Conductor[]
  onEdit: (conductor: Conductor) => void
  onRefresh: () => void

  page: number
  pageSize: number
  totalPages: number
  total: number

  onPageChange: (page: number) => void

  onPageSizeChange: (pageSize: number) => void
}

export function ConductorTable({
  conductores,
  onEdit,
  onRefresh,
  page,
  pageSize,
  totalPages,
  total,
  onPageChange,
  onPageSizeChange,
}: ConductorTableProps) {
  const [conductorAEliminar, setConductorAEliminar] =
    useState<Conductor | null>(null)

  /**
   * Exporta los conductores actualmente mostrados
   * en la tabla a un archivo Excel.
   */
  function handleExportarExcel() {
    if (conductores.length === 0) {
      return
    }

    const datos = conductores.map((conductor) => ({
      "Nombre completo": conductor.nombreCompleto,

      "N.º de licencia": conductor.numeroLicencia,

      Teléfono: conductor.telefono ?? "—",

      Estado: "Activo",
    }))

    exportarExcel({
      datos,
      nombreArchivo: "conductores",
      nombreHoja: "Conductores",
    })
  }

  /**
   * Genera los números de página.
   */
  function obtenerPaginas() {
    const paginas: (number | "ellipsis")[] = []

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        paginas.push(i)
      }

      return paginas
    }

    paginas.push(1)

    if (page > 3) {
      paginas.push("ellipsis")
    }

    const inicio = Math.max(2, page - 1)

    const fin = Math.min(totalPages - 1, page + 1)

    for (let i = inicio; i <= fin; i++) {
      paginas.push(i)
    }

    if (page < totalPages - 2) {
      paginas.push("ellipsis")
    }

    paginas.push(totalPages)

    return paginas
  }

  /**
   * Estado vacío.
   */
  if (conductores.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <UserRound className="mx-auto size-8 text-muted-foreground" />

        <p className="mt-3 text-sm font-medium">
          No hay conductores registrados.
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          Los conductores registrados aparecerán aquí.
        </p>
      </div>
    )
  }

  const paginas = obtenerPaginas()

  const desde = (page - 1) * pageSize + 1

  const hasta = Math.min(page * pageSize, total)

  return (
    <>
      {/* =====================================================
          ENCABEZADO
      ====================================================== */}

      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium">Conductores registrados</h2>

          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? "conductor" : "conductores"}
          </p>
        </div>

        <Button variant="outline" onClick={handleExportarExcel}>
          <Download className="mr-2 size-4" />
          Exportar Excel
        </Button>
      </div>

      {/* =====================================================
          TABLA
      ====================================================== */}

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Conductor</TableHead>

              <TableHead>N.º de licencia</TableHead>

              <TableHead>Teléfono</TableHead>

              <TableHead>Estado</TableHead>

              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {conductores.map((conductor) => (
              <TableRow key={conductor.id}>
                {/* =================================================
                      CONDUCTOR
                  ================================================== */}

                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-muted">
                      <UserRound className="size-4 text-muted-foreground" />
                    </div>

                    <div>
                      <p className="font-medium">{conductor.nombreCompleto}</p>

                      <p className="text-xs text-muted-foreground">
                        ID #{conductor.id}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* =================================================
                      LICENCIA
                  ================================================== */}

                <TableCell>
                  <span className="font-medium">
                    {conductor.numeroLicencia}
                  </span>
                </TableCell>

                {/* =================================================
                      TELÉFONO
                  ================================================== */}

                <TableCell>
                  <span className="text-sm">{conductor.telefono ?? "—"}</span>
                </TableCell>

                {/* =================================================
                      ESTADO
                  ================================================== */}

                <TableCell>
                  <Badge>Activo</Badge>
                </TableCell>

                {/* =================================================
                      ACCIONES
                  ================================================== */}

                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Editar conductor"
                      onClick={() => onEdit(conductor)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* =====================================================
          PAGINACIÓN
      ====================================================== */}

      <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
        {/* CANTIDAD */}

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Mostrar</span>

          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-[75px]">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="10">10</SelectItem>

              <SelectItem value="20">20</SelectItem>

              <SelectItem value="30">30</SelectItem>

              <SelectItem value="50">50</SelectItem>

              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>

          <span className="text-sm text-muted-foreground">filas</span>
        </div>

        {/* INFORMACIÓN */}

        <div className="text-sm text-muted-foreground">
          Mostrando <span className="font-medium text-foreground">{desde}</span>
          {"–"}
          <span className="font-medium text-foreground">{hasta}</span> de{" "}
          <span className="font-medium text-foreground">{total}</span>
        </div>

        {/* NAVEGACIÓN */}

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
              title="Página anterior"
            >
              <ChevronLeft className="size-4" />
            </Button>

            {paginas.map((pagina, index) => {
              if (pagina === "ellipsis") {
                return (
                  <Button
                    key={`ellipsis-${index}`}
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    disabled
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                )
              }

              return (
                <Button
                  key={pagina}
                  variant={pagina === page ? "default" : "outline"}
                  size="icon"
                  className="size-8"
                  onClick={() => onPageChange(pagina)}
                >
                  {pagina}
                </Button>
              )
            })}

            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={page === totalPages}
              onClick={() => onPageChange(page + 1)}
              title="Página siguiente"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
