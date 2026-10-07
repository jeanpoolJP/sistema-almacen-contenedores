"use client"

import {
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  MoreHorizontal,
  Power,
} from "lucide-react"
import { toast } from "sonner"

import type { Operador } from "../operadores.types"
import { alternarEstadoOperador } from "../operadores.actions"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { exportarExcel } from "@/lib/exportar-excel"

type OperadorTableProps = {
  operadores: Operador[]
  onEdit: (operador: Operador) => void
  onRefresh: () => void
  page: number
  pageSize: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

const etiquetasDocumento = {
  DNI: "DNI",
  CARNET_EXTRANJERIA: "Carné de extranjería",
  PASAPORTE: "Pasaporte",
  OTRO: "Otro",
} satisfies Record<Operador["tipoDocumento"], string>

export function OperadorTable({
  operadores,
  onEdit,
  onRefresh,
  page,
  pageSize,
  totalPages,
  total,
  onPageChange,
  onPageSizeChange,
}: OperadorTableProps) {
  async function handleCambiarEstado(operador: Operador) {
    const nuevoEstado = !operador.activo
    const mensaje = nuevoEstado
      ? "¿Activar este operador?"
      : "¿Desactivar este operador?"

    if (!window.confirm(mensaje)) return

    try {
      const resultado = await alternarEstadoOperador(operador.id, nuevoEstado)

      if (!resultado.success) {
        toast.error(resultado.error)
        return
      }

      toast.success(
        nuevoEstado
          ? "Operador activado correctamente"
          : "Operador desactivado correctamente"
      )
      onRefresh()
    } catch (error) {
      console.error("Error al cambiar el estado del operador:", error)
      toast.error("No se pudo cambiar el estado del operador")
    }
  }

  function handleExportarExcel() {
    if (operadores.length === 0) return

    exportarExcel({
      datos: operadores.map((operador) => ({
        Nombres: operador.nombres,
        Apellidos: operador.apellidos,
        "Tipo de documento": etiquetasDocumento[operador.tipoDocumento],
        "Número de documento": operador.numeroDocumento,
        Teléfono: operador.telefono ?? "",
        Licencia: operador.licencia ?? "",
        Estado: operador.activo ? "Activo" : "Inactivo",
        Observaciones: operador.observaciones ?? "",
      })),
      nombreArchivo: "operadores",
      nombreHoja: "Operadores",
    })
  }

  const desde = total === 0 ? 0 : (page - 1) * pageSize + 1
  const hasta = Math.min(page * pageSize, total)
  const paginas: (number | "ellipsis")[] = []

  if (totalPages <= 7) {
    for (let pagina = 1; pagina <= totalPages; pagina++) paginas.push(pagina)
  } else {
    paginas.push(1)
    if (page > 3) paginas.push("ellipsis")
    for (
      let pagina = Math.max(2, page - 1);
      pagina <= Math.min(totalPages - 1, page + 1);
      pagina++
    ) {
      paginas.push(pagina)
    }
    if (page < totalPages - 2) paginas.push("ellipsis")
    paginas.push(totalPages)
  }

  return (
    <>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-medium">Operadores registrados</h2>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? "operador" : "operadores"}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleExportarExcel}
          disabled={operadores.length === 0}
        >
          <Download className="mr-2 size-4" />
          Exportar Excel
        </Button>
      </div>

      <div className="w-full overflow-x-auto rounded-lg border">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[25%]">Operador</TableHead>
              <TableHead className="w-[22%]">Documento</TableHead>
              <TableHead className="w-[17%]">Teléfono</TableHead>
              <TableHead className="hidden w-[18%] sm:table-cell">
                Licencia
              </TableHead>
              <TableHead className="w-[18%]">Estado</TableHead>
              <TableHead className="w-[60px] text-right">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operadores.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No se encontraron operadores.
                </TableCell>
              </TableRow>
            ) : (
              operadores.map((operador) => (
                <TableRow key={operador.id}>
                  <TableCell className="max-w-0">
                    <div
                      className="truncate font-medium"
                      title={`${operador.apellidos}, ${operador.nombres}`}
                    >
                      {operador.apellidos}, {operador.nombres}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-0">
                    <div className="truncate" title={operador.numeroDocumento}>
                      {operador.numeroDocumento}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {etiquetasDocumento[operador.tipoDocumento]}
                    </div>
                  </TableCell>
                  <TableCell className="truncate whitespace-nowrap">
                    {operador.telefono || "-"}
                  </TableCell>
                  <TableCell className="hidden max-w-0 sm:table-cell">
                    <div
                      className="truncate"
                      title={operador.licencia || undefined}
                    >
                      {operador.licencia || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        operador.activo
                          ? "text-sm text-emerald-700"
                          : "text-sm text-muted-foreground"
                      }
                    >
                      {operador.activo ? "Activo" : "Inactivo"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Abrir acciones</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(operador)}>
                          <Edit className="mr-2 size-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleCambiarEstado(operador)}
                        >
                          <Power className="mr-2 size-4" />
                          {operador.activo ? "Desactivar" : "Activar"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {total > 0 && (
        <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
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
                {[10, 20, 30, 50, 100].map((cantidad) => (
                  <SelectItem key={cantidad} value={String(cantidad)}>
                    {cantidad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">filas</span>
          </div>

          <div className="text-sm text-muted-foreground">
            Mostrando{" "}
            <span className="font-medium text-foreground">{desde}</span>–
            <span className="font-medium text-foreground">{hasta}</span> de{" "}
            <span className="font-medium text-foreground">{total}</span>
          </div>

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
              {paginas.map((pagina, index) =>
                pagina === "ellipsis" ? (
                  <Button
                    key={`ellipsis-${index}`}
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    disabled
                    aria-label="Páginas omitidas"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                ) : (
                  <Button
                    key={pagina}
                    variant={pagina === page ? "default" : "outline"}
                    size="icon"
                    className="size-8"
                    onClick={() => onPageChange(pagina)}
                    aria-label={`Página ${pagina}`}
                    aria-current={pagina === page ? "page" : undefined}
                  >
                    {pagina}
                  </Button>
                )
              )}
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
      )}
    </>
  )
}
