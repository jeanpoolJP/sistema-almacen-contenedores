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

import { cambiarEstadoEmpresaTransporteAction } from "../empresa-transporte.actions"

import type { EmpresaTransporte } from "../empresa-transporte.types"

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

type EmpresaTransporteTableProps = {
  empresas: EmpresaTransporte[]

  onEdit: (empresa: EmpresaTransporte) => void

  onRefresh: () => void

  page: number

  pageSize: number

  totalPages: number

  total: number

  onPageChange: (page: number) => void

  onPageSizeChange: (pageSize: number) => void
}

export function EmpresaTransporteTable({
  empresas,
  onEdit,
  onRefresh,
  page,
  pageSize,
  totalPages,
  total,
  onPageChange,
  onPageSizeChange,
}: EmpresaTransporteTableProps) {
  /**
   * Cambia el estado de una empresa.
   */
  async function handleCambiarEstado(empresa: EmpresaTransporte) {
    const nuevoEstado = !empresa.activo

    const mensaje = nuevoEstado
      ? "¿Activar esta empresa de transporte?"
      : "¿Desactivar esta empresa de transporte?"

    const confirmado = window.confirm(mensaje)

    if (!confirmado) {
      return
    }

    try {
      const resultado = await cambiarEstadoEmpresaTransporteAction({
        id: empresa.id,
        activo: nuevoEstado,
      })

      if (!resultado.success) {
        toast.error(resultado.message)
        return
      }

      toast.success(resultado.message)

      onRefresh()
    } catch (error) {
      console.error(error)

      toast.error("No se pudo cambiar el estado de la empresa")
    }
  }

  /**
   * Exporta las empresas actualmente
   * mostradas en la tabla a Excel.
   */
  function handleExportarExcel() {
    if (empresas.length === 0) {
      return
    }

    const datos = empresas.map((empresa) => ({
      Empresa: empresa.nombre,
      RUC: empresa.ruc,
      Teléfono: empresa.telefono ?? "",
      "Contacto logístico / compras": empresa.contactoLogistico ?? "",
      "Nombre del encargado": empresa.nombreEncargado ?? "",
    }))

    exportarExcel({
      datos,
      nombreArchivo: "empresas-transporte",
      nombreHoja: "Empresas de transporte",
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

  const paginas = obtenerPaginas()

  /**
   * Rango de registros mostrado.
   */
  const desde = total === 0 ? 0 : (page - 1) * pageSize + 1

  const hasta = Math.min(page * pageSize, total)

  return (
    <>
      {/* =====================================================
          ENCABEZADO
      ====================================================== */}

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-medium">Empresas de transporte</h2>

          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? "empresa" : "empresas"}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleExportarExcel}
          disabled={empresas.length === 0}
        >
          <Download className="mr-2 size-4" />
          Exportar Excel
        </Button>
      </div>

      {/* =====================================================
          TABLA
      ====================================================== */}

      <div className="w-full overflow-x-auto rounded-lg border">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              {/* EMPRESA */}

              <TableHead className="w-[28%]">Empresa</TableHead>

              {/* RUC */}

              <TableHead className="w-[16%]">RUC</TableHead>

              {/* TELÉFONO */}

              <TableHead className="w-[16%]">Teléfono</TableHead>

              {/* CONTACTO */}

              <TableHead className="hidden w-[20%] lg:table-cell">
                Contacto logístico
              </TableHead>

              {/* ENCARGADO */}

              <TableHead className="hidden w-[16%] lg:table-cell">
                Encargado
              </TableHead>

              {/* ACCIONES */}

              <TableHead className="w-[60px] text-right">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {empresas.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No se encontraron empresas de transporte.
                </TableCell>
              </TableRow>
            ) : (
              empresas.map((empresa) => (
                <TableRow key={empresa.id}>
                  {/* EMPRESA */}

                  <TableCell className="max-w-0">
                    <div
                      className="truncate font-medium"
                      title={empresa.nombre}
                    >
                      {empresa.nombre}
                    </div>
                  </TableCell>

                  {/* RUC */}

                  <TableCell className="whitespace-nowrap">
                    {empresa.ruc}
                  </TableCell>

                  {/* TELÉFONO */}

                  <TableCell className="whitespace-nowrap">
                    {empresa.telefono || "-"}
                  </TableCell>

                  {/* CONTACTO */}

                  <TableCell className="hidden max-w-0 lg:table-cell">
                    <div
                      className="truncate"
                      title={empresa.contactoLogistico || undefined}
                    >
                      {empresa.contactoLogistico || "-"}
                    </div>
                  </TableCell>

                  {/* ENCARGADO */}

                  <TableCell className="hidden max-w-0 lg:table-cell">
                    <div
                      className="truncate"
                      title={empresa.nombreEncargado || undefined}
                    >
                      {empresa.nombreEncargado || "-"}
                    </div>
                  </TableCell>

                  {/* ACCIONES */}

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
                        <MoreHorizontal className="size-4" />

                        <span className="sr-only">Abrir acciones</span>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(empresa)}>
                          <Edit className="mr-2 size-4" />
                          Editar
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleCambiarEstado(empresa)}
                        >
                          <Power className="mr-2 size-4" />

                          {empresa.activo ? "Desactivar" : "Activar"}
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

      {/* =====================================================
          PAGINACIÓN
      ====================================================== */}

      {total > 0 && (
        <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
          {/* CANTIDAD DE FILAS */}

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
            Mostrando{" "}
            <span className="font-medium text-foreground">{desde}</span>–
            <span className="font-medium text-foreground">{hasta}</span> de{" "}
            <span className="font-medium text-foreground">{total}</span>
          </div>

          {/* NAVEGACIÓN */}

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              {/* ANTERIOR */}

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

              {/* PÁGINAS */}

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

              {/* SIGUIENTE */}

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
