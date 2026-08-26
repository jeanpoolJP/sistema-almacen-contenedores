"use client";

import {
  ChevronLeft,
  ChevronRight,
  Download,
  MoreHorizontal,
  Pencil,
  Box,
} from "lucide-react";

import type { Contenedor } from "../contenedores.types";

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

type ContenedorTableProps = {
  contenedores: Contenedor[];

  onEdit: (
    contenedor: Contenedor,
  ) => void;

  onRefresh: () => void;

  // ============================================================
  // PAGINACIÓN
  // ============================================================

  page: number;

  pageSize: number;

  totalPages: number;

  total: number;

  onPageChange: (
    page: number,
  ) => void;

  onPageSizeChange: (
    pageSize: number,
  ) => void;
};

export function ContenedorTable({
  contenedores,
  onEdit,
  onRefresh,
  page,
  pageSize,
  totalPages,
  total,
  onPageChange,
  onPageSizeChange,
}: ContenedorTableProps) {
  /**
   * Exporta los contenedores actualmente
   * mostrados en la tabla a Excel.
   */
  function handleExportarExcel() {
    if (contenedores.length === 0) {
      return;
    }

    const datos = contenedores.map(
      (contenedor) => ({
        "Número de contenedor":
          contenedor.numeroContenedor,

        Marca: contenedor.marca,

        "Medida (pies)":
          contenedor.medida,

        Tipo:
          contenedor.tipo ===
          "REEFER"
            ? "Reefer"
            : "Normal",
      }),
    );

    exportarExcel({
      datos,
      nombreArchivo:
        "contenedores",
      nombreHoja:
        "Contenedores",
    });
  }

  /**
   * Genera los números de página.
   *
   * Cuando existen muchas páginas,
   * muestra puntos suspensivos.
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

  if (contenedores.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <Box className="mx-auto size-8 text-muted-foreground" />

        <p className="mt-3 text-sm text-muted-foreground">
          No hay contenedores registrados.
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
            Contenedores registrados
          </h2>

          <p className="text-sm text-muted-foreground">
            {total}{" "}
            {total === 1
              ? "contenedor"
              : "contenedores"}
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
                Número
              </TableHead>

              <TableHead>
                Marca
              </TableHead>

              <TableHead>
                Medida
              </TableHead>

              <TableHead>
                Tipo
              </TableHead>

              <TableHead className="text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {contenedores.map(
              (contenedor) => (
                <TableRow
                  key={
                    contenedor.id
                  }
                >
                  {/* =================================================
                      NÚMERO
                  ================================================== */}

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Box className="size-4 text-muted-foreground" />

                      <span className="font-medium">
                        {
                          contenedor.numeroContenedor
                        }
                      </span>
                    </div>
                  </TableCell>

                  {/* =================================================
                      MARCA
                  ================================================== */}

                  <TableCell>
                    {contenedor.marca}
                  </TableCell>

                  {/* =================================================
                      MEDIDA
                  ================================================== */}

                  <TableCell>
                    <Badge variant="outline">
                      {
                        contenedor.medida
                      }{" "}
                      pies
                    </Badge>
                  </TableCell>

                  {/* =================================================
                      TIPO
                  ================================================== */}

                  <TableCell>
                    {contenedor.tipo ===
                    "REEFER" ? (
                      <Badge>
                        Reefer
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        Normal
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
                        title="Editar contenedor"
                        onClick={() =>
                          onEdit(
                            contenedor,
                          )
                        }
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ),
            )}
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
            value={String(
              pageSize,
            )}
            onValueChange={(
              value,
            ) =>
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
          –
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
                onPageChange(
                  page - 1,
                )
              }
              title="Página anterior"
            >
              <ChevronLeft className="size-4" />
            </Button>

            {/* NÚMEROS */}

            {paginas.map(
              (
                pagina,
                index,
              ) => {
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
                      pagina ===
                      page
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
                page ===
                totalPages
              }
              onClick={() =>
                onPageChange(
                  page + 1,
                )
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