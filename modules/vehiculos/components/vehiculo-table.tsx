// modules\vehiculos\components\vehiculo-table.tsx

"use client";

import {
  Car,
  ChevronLeft,
  ChevronRight,
  Download,
  Pencil,
} from "lucide-react";

import type { Vehiculo } from "../vehiculos.types";

import { exportarExcel } from "@/lib/exportar-excel";

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

type VehiculoTableProps = {
  vehiculos: Vehiculo[];

  total: number;
  page: number;
  pageSize: number;
  totalPages: number;

  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;

  onEdit: (vehiculo: Vehiculo) => void;
  onRefresh: () => void;
};

export function VehiculoTable({
  vehiculos,
  total,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onEdit,
}: VehiculoTableProps) {
  /**
   * Exporta los vehículos actualmente mostrados
   * en la página a Excel.
   */
  function handleExportarExcel() {
    if (vehiculos.length === 0) {
      return;
    }

    const datos = vehiculos.map((vehiculo) => ({
      Placa: vehiculo.placa,
      Registrado: new Intl.DateTimeFormat(
        "es-PE",
        {
          dateStyle: "medium",
        },
      ).format(new Date(vehiculo.createdAt)),
    }));

    exportarExcel({
      datos,
      nombreArchivo: "vehiculos",
      nombreHoja: "Vehículos",
    });
  }

  /**
   * Si no existen vehículos.
   */
  if (vehiculos.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <Car className="mx-auto size-8 text-muted-foreground" />

        <p className="mt-3 text-sm font-medium">
          No hay vehículos registrados.
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          Registra el primer vehículo para comenzar.
        </p>
      </div>
    );
  }

  /**
   * Calcula el primer registro mostrado.
   */
  const desde =
    (page - 1) * pageSize + 1;

  /**
   * Calcula el último registro mostrado.
   */
  const hasta = Math.min(
    page * pageSize,
    total,
  );

  return (
    <>
      {/* =====================================================
          ENCABEZADO
      ====================================================== */}

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-medium">
            Vehículos registrados
          </h2>

          <p className="text-sm text-muted-foreground">
            Mostrando {desde}-{hasta} de {total}{" "}
            {total === 1
              ? "vehículo"
              : "vehículos"}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleExportarExcel}
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
                Placa
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
            {vehiculos.map((vehiculo) => (
              <TableRow key={vehiculo.id}>
                {/* =================================================
                    PLACA
                ================================================== */}

                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-md bg-muted">
                      <Car className="size-4 text-muted-foreground" />
                    </div>

                    <span className="font-semibold">
                      {vehiculo.placa}
                    </span>
                  </div>
                </TableCell>

                {/* =================================================
                    FECHA
                ================================================== */}

                <TableCell className="text-muted-foreground">
                  {new Intl.DateTimeFormat(
                    "es-PE",
                    {
                      dateStyle: "medium",
                    },
                  ).format(
                    new Date(
                      vehiculo.createdAt,
                    ),
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
                      title="Editar vehículo"
                      onClick={() =>
                        onEdit(vehiculo)
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

      <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
        {/* FILAS POR PÁGINA */}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Filas por página</span>

          <Select
            value={String(pageSize)}
            onValueChange={(value) =>
              onPageSizeChange(
                Number(value),
              )
            }
          >
            <SelectTrigger className="h-8 w-[80px]">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="5">
                5
              </SelectItem>

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
        </div>

        {/* NAVEGACIÓN */}

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>

          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page <= 1}
            onClick={() =>
              onPageChange(page - 1)
            }
            title="Página anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={
              page >= totalPages
            }
            onClick={() =>
              onPageChange(page + 1)
            }
            title="Página siguiente"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </>
  );
}