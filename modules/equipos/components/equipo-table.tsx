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

import type { EstadoEquipo, TipoEquipo } from "@/lib/generated/prisma/client"
import type { Equipo } from "../equipos.types"
import { cambiarEstadoEquipo } from "../equipos.actions"

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

type EquipoTableProps = {
  equipos: Equipo[]
  onEdit: (equipo: Equipo) => void
  onRefresh: () => void
  page: number
  pageSize: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

const etiquetaTipo: Record<TipoEquipo, string> = {
  MONTACARGAS: "Montacargas",
  STACKER: "Stacker",
  OTRO: "Otro",
}

const etiquetaEstado: Record<EstadoEquipo, string> = {
  DISPONIBLE: "Disponible",
  EN_REPARACION: "En reparación",
  INOPERATIVO: "Inoperativo",
}

const estados: EstadoEquipo[] = ["DISPONIBLE", "EN_REPARACION", "INOPERATIVO"]

export function EquipoTable({
  equipos,
  onEdit,
  onRefresh,
  page,
  pageSize,
  totalPages,
  total,
  onPageChange,
  onPageSizeChange,
}: EquipoTableProps) {
  async function handleCambiarEstado(
    equipo: Equipo,
    nuevoEstado: EstadoEquipo
  ) {
    const mensaje = `¿Cambiar el estado de ${equipo.nombre} a ${etiquetaEstado[nuevoEstado]}?`
    if (!window.confirm(mensaje)) return

    try {
      const resultado = await cambiarEstadoEquipo(equipo.id, nuevoEstado)
      if (!resultado.success) {
        toast.error(resultado.error)
        return
      }

      toast.success(`Estado actualizado: ${etiquetaEstado[nuevoEstado]}`)
      onRefresh()
    } catch (error) {
      console.error("Error al cambiar el estado del equipo:", error)
      toast.error("No se pudo cambiar el estado del equipo")
    }
  }

  function handleExportarExcel() {
    if (equipos.length === 0) return

    exportarExcel({
      datos: equipos.map((equipo) => ({
        Código: equipo.codigo,
        Nombre: equipo.nombre,
        Tipo: etiquetaTipo[equipo.tipo],
        Marca: equipo.marca ?? "",
        Modelo: equipo.modelo ?? "",
        Placa: equipo.placa ?? "",
        "Capacidad de carga (t)": equipo.capacidadCarga ?? "",
        Estado: etiquetaEstado[equipo.estado],
        Observaciones: equipo.observaciones ?? "",
      })),
      nombreArchivo: "equipos",
      nombreHoja: "Equipos",
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
          <h2 className="text-sm font-medium">Equipos registrados</h2>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? "equipo" : "equipos"}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExportarExcel}
          disabled={equipos.length === 0}
        >
          <Download className="mr-2 size-4" />
          Exportar Excel
        </Button>
      </div>

      <div className="w-full overflow-x-auto rounded-lg border">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[18%]">Equipo</TableHead>
              <TableHead className="w-[16%]">Código</TableHead>
              <TableHead className="w-[16%]">Tipo</TableHead>
              <TableHead className="hidden w-[20%] sm:table-cell">
                Marca / modelo
              </TableHead>
              <TableHead className="hidden w-[14%] md:table-cell">
                Capacidad
              </TableHead>
              <TableHead className="w-[16%]">Estado</TableHead>
              <TableHead className="w-[60px] text-right">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipos.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  No se encontraron equipos.
                </TableCell>
              </TableRow>
            ) : (
              equipos.map((equipo) => (
                <TableRow key={equipo.id}>
                  <TableCell className="max-w-0">
                    <div className="truncate font-medium" title={equipo.nombre}>
                      {equipo.nombre}
                    </div>
                    {equipo.placa && (
                      <div className="truncate text-xs text-muted-foreground">
                        {equipo.placa}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="truncate whitespace-nowrap">
                    {equipo.codigo}
                  </TableCell>
                  <TableCell>{etiquetaTipo[equipo.tipo]}</TableCell>
                  <TableCell className="hidden max-w-0 sm:table-cell">
                    <div
                      className="truncate"
                      title={[equipo.marca, equipo.modelo]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {[equipo.marca, equipo.modelo]
                        .filter(Boolean)
                        .join(" ") || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap md:table-cell">
                    {equipo.capacidadCarga ? `${equipo.capacidadCarga} TN` : "-"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        equipo.estado === "DISPONIBLE"
                          ? "text-sm text-emerald-700"
                          : equipo.estado === "EN_REPARACION"
                            ? "text-sm text-amber-700"
                            : "text-sm text-destructive"
                      }
                    >
                      {etiquetaEstado[equipo.estado]}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Abrir acciones</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(equipo)}>
                          <Edit className="mr-2 size-4" />
                          Editar
                        </DropdownMenuItem>
                        {estados
                          .filter((estado) => estado !== equipo.estado)
                          .map((estado) => (
                            <DropdownMenuItem
                              key={estado}
                              onClick={() =>
                                handleCambiarEstado(equipo, estado)
                              }
                            >
                              <Power className="mr-2 size-4" />
                              Marcar: {etiquetaEstado[estado]}
                            </DropdownMenuItem>
                          ))}
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
