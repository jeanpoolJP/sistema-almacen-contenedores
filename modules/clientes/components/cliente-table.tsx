"use client";

import { useState } from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Download,
  MoreHorizontal,
  Pencil,
  User,
} from "lucide-react";

import type { Cliente } from "../cliente.types";

import { exportarExcel } from "@/lib/exportar-excel";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ClienteTableProps = {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onRefresh: () => void;

  // ============================================================
  // PAGINACIÓN
  // ============================================================

  page: number;
  pageSize: number;
  totalPages: number;
  total: number;

  onPageChange: (page: number) => void;

  onPageSizeChange: (
    pageSize: number,
  ) => void;
};

export function ClienteTable({
  clientes,
  onEdit,
  onRefresh,
  page,
  pageSize,
  totalPages,
  total,
  onPageChange,
  onPageSizeChange,
}: ClienteTableProps) {
  const [
    clienteAEliminar,
    setClienteAEliminar,
  ] = useState<Cliente | null>(null);

  /**
   * Exporta los clientes actualmente
   * mostrados en la tabla a Excel.
   */
  function handleExportarExcel() {
    if (clientes.length === 0) {
      return;
    }

    const datos = clientes.map(
      (cliente) => ({
        "Tipo de documento":
          cliente.tipoDocumento,

        "Número de documento":
          cliente.numeroDocumento,

        "Nombre / razón social":
          cliente.nombreCompleto ?? "—",

        Teléfono:
          cliente.telefono ?? "—",

        Estado: cliente.activo
          ? "Activo"
          : "Inactivo",

        Observaciones:
          cliente.observaciones ?? "—",
      }),
    );

    exportarExcel({
      datos,
      nombreArchivo: "clientes",
      nombreHoja: "Clientes",
    });
  }

  /**
   * Genera los números de página.
   *
   * Cuando existen muchas páginas,
   * muestra puntos suspensivos para
   * mantener la interfaz limpia.
   */
  function obtenerPaginas() {
    const paginas: (
      | number
      | "ellipsis"
    )[] = [];

    if (totalPages <= 7) {
      for (
        let i = 1;
        i <= totalPages;
        i++
      ) {
        paginas.push(i);
      }

      return paginas;
    }

    paginas.push(1);

    if (page > 3) {
      paginas.push("ellipsis");
    }

    const inicio = Math.max(
      2,
      page - 1,
    );

    const fin = Math.min(
      totalPages - 1,
      page + 1,
    );

    for (
      let i = inicio;
      i <= fin;
      i++
    ) {
      paginas.push(i);
    }

    if (page < totalPages - 2) {
      paginas.push("ellipsis");
    }

    paginas.push(totalPages);

    return paginas;
  }

  /**
   * Si no existen registros, muestra
   * el estado vacío.
   */
  if (clientes.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No hay clientes registrados.
        </p>
      </div>
    );
  }

  const paginas = obtenerPaginas();

  /**
   * Calcula el rango de registros
   * que se están mostrando.
   */
  const desde =
    (page - 1) * pageSize + 1;

  const hasta = Math.min(
    page * pageSize,
    total,
  );

  return (
    <>
      {/* =====================================================
          ENCABEZADO DE LA TABLA
      ====================================================== */}

      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium">
            Clientes registrados
          </h2>

          <p className="text-sm text-muted-foreground">
            {total}{" "}
            {total === 1
              ? "cliente"
              : "clientes"}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={
            handleExportarExcel
          }
        >
          <Download className="mr-2 size-4" />

          Exportar Excel
        </Button>
      </div>

      {/* =====================================================
          TABLA
      ====================================================== */}

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                Documento
              </TableHead>

              <TableHead>
                Cliente
              </TableHead>

              <TableHead>
                Teléfono
              </TableHead>

              <TableHead>
                Estado
              </TableHead>

              <TableHead className="text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {clientes.map((cliente) => {
              const esEmpresa =
                cliente.tipoDocumento ===
                "RUC";

              return (
                <TableRow
                  key={cliente.id}
                >
                  {/* =================================================
                      DOCUMENTO
                  ================================================== */}

                  <TableCell>
                    <div className="flex items-center gap-2">
                      {esEmpresa ? (
                        <Building2 className="size-4 text-muted-foreground" />
                      ) : (
                        <User className="size-4 text-muted-foreground" />
                      )}

                      <div>
                        <p className="font-medium">
                          {
                            cliente.numeroDocumento
                          }
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {
                            cliente.tipoDocumento
                          }
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* =================================================
                      CLIENTE
                  ================================================== */}

                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {
                          cliente.nombreCompleto ??
                          "—"
                        }
                      </p>

                      {cliente.observaciones && (
                        <p className="max-w-sm truncate text-xs text-muted-foreground">
                          {
                            cliente.observaciones
                          }
                        </p>
                      )}
                    </div>
                  </TableCell>

                  {/* =================================================
                      TELÉFONO
                  ================================================== */}

                  <TableCell>
                    {cliente.telefono ??
                      "—"}
                  </TableCell>

                  {/* =================================================
                      ESTADO
                  ================================================== */}

                  <TableCell>
                    {cliente.activo ? (
                      <Badge>
                        Activo
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        Inactivo
                      </Badge>
                    )}
                  </TableCell>

                  {/* =================================================
                      ACCIONES
                  ================================================== */}

                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Editar cliente"
                        onClick={() =>
                          onEdit(
                            cliente,
                          )
                        }
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* =====================================================
          PAGINACIÓN
      ====================================================== */}

      <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
        {/* ===================================================
            CANTIDAD DE FILAS
        ==================================================== */}

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Mostrar
          </span>

          <Select
            value={String(pageSize)}
            onValueChange={(value) =>
              onPageSizeChange(
                Number(value),
              )
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

        {/* ===================================================
            INFORMACIÓN
        ==================================================== */}

        <div className="text-sm text-muted-foreground">
          Mostrando{" "}
          <span className="font-medium text-foreground">
            {desde}
          </span>
          {"–"}
          <span className="font-medium text-foreground">
            {hasta}
          </span>{" "}
          de{" "}
          <span className="font-medium text-foreground">
            {total}
          </span>
        </div>

        {/* ===================================================
            NAVEGACIÓN
        ==================================================== */}

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {/* ANTERIOR */}

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

            {/* NÚMEROS */}

            {paginas.map(
              (pagina, index) => {
                if (
                  pagina ===
                  "ellipsis"
                ) {
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
                  );
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
                      onPageChange(
                        pagina,
                      )
                    }
                  >
                    {pagina}
                  </Button>
                );
              },
            )}

            {/* SIGUIENTE */}

            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={
                page === totalPages
              }
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
    </>
  );
}