// modules\flat-racks\components\flat-rack-table.tsx

"use client"

import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
} from "lucide-react"

import type { FlatRack } from "../flat-rack.types"

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

type FlatRackTableProps = {
  flatRacks: FlatRack[]

  onEdit: (flatRack: FlatRack) => void

  page: number
  pageSize: number
  totalPages: number
  total: number

  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function FlatRackTable({
  flatRacks,
  onEdit,
  page,
  pageSize,
  totalPages,
  total,
  onPageChange,
  onPageSizeChange,
}: FlatRackTableProps) {
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

  if (flatRacks.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No hay Flat Racks registrados.
        </p>
      </div>
    )
  }

  const paginas = obtenerPaginas()

  const desde = (page - 1) * pageSize + 1

  const hasta = Math.min(
    page * pageSize,
    total,
  )

  return (
    <div className="space-y-4">
      {/* =====================================================
          ENCABEZADO
      ====================================================== */}

      <div>
        <h2 className="text-sm font-medium">
          Flat Racks registrados
        </h2>

        <p className="text-sm text-muted-foreground">
          {total}{" "}
          {total === 1
            ? "Flat Rack"
            : "Flat Racks"}
        </p>
      </div>

      {/* =====================================================
          TABLA
      ====================================================== */}

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                Número
              </TableHead>

              <TableHead>
                Marca
              </TableHead>

              <TableHead>
                Registrado
              </TableHead>

              <TableHead className="text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {flatRacks.map((flatRack) => (
              <TableRow key={flatRack.id}>
                <TableCell>
                  <span className="font-medium">
                    {flatRack.numero}
                  </span>
                </TableCell>

                <TableCell>
                  {flatRack.marca}
                </TableCell>

                <TableCell>
                  {flatRack.createdAt.toLocaleDateString(
                    "es-PE",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    },
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Editar Flat Rack"
                      onClick={() =>
                        onEdit(flatRack)
                      }
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

      <div className="flex flex-col gap-4 pt-2 md:flex-row md:items-center md:justify-between">
        {/* Cantidad */}

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Mostrar
          </span>

          <Select
            value={String(pageSize)}
            onValueChange={(value) =>
              onPageSizeChange(Number(value))
            }
          >
            <SelectTrigger className="w-[75px]">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="10">
                10
              </SelectItem>

              <SelectItem value="20">
                20
              </SelectItem>

              <SelectItem value="30">
                30
              </SelectItem>

              <SelectItem value="50">
                50
              </SelectItem>

              <SelectItem value="100">
                100
              </SelectItem>
            </SelectContent>
          </Select>

          <span className="text-sm text-muted-foreground">
            filas
          </span>
        </div>

        {/* Información */}

        <div className="text-sm text-muted-foreground">
          Mostrando{" "}
          <span className="font-medium text-foreground">
            {desde}
          </span>
          –
          <span className="font-medium text-foreground">
            {hasta}
          </span>{" "}
          de{" "}
          <span className="font-medium text-foreground">
            {total}
          </span>
        </div>

        {/* Navegación */}

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={page === 1}
              onClick={() =>
                onPageChange(page - 1)
              }
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
                  variant={
                    pagina === page
                      ? "default"
                      : "outline"
                  }
                  size="icon"
                  className="size-8"
                  onClick={() =>
                    onPageChange(pagina)
                  }
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
              onClick={() =>
                onPageChange(page + 1)
              }
              title="Página siguiente"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
