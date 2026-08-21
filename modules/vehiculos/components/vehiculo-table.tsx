"use client";

import { useState } from "react";
import {
  Car,
  Pencil,
  Trash2,
} from "lucide-react";

import type { Vehiculo } from "../vehiculos.types";

import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { VehiculoDeleteDialog } from "./vehiculo-delete-dialog";

type VehiculoTableProps = {
  vehiculos: Vehiculo[];
  onEdit: (vehiculo: Vehiculo) => void;
  onRefresh: () => void;
};

export function VehiculoTable({
  vehiculos,
  onEdit,
  onRefresh,
}: VehiculoTableProps) {
  const [
    vehiculoAEliminar,
    setVehiculoAEliminar,
  ] = useState<Vehiculo | null>(null);

  if (vehiculos.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <Car className="mx-auto size-8 text-muted-foreground" />

        <p className="mt-3 text-sm font-medium">
          No hay vehículos registrados.
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          Registra el primer vehículo para
          comenzar.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Placa</TableHead>

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
                {/* Placa */}
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

                {/* Fecha */}
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

                {/* Acciones */}
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

                    <Button
                      variant="ghost"
                      size="icon"
                      title="Eliminar vehículo"
                      onClick={() =>
                        setVehiculoAEliminar(
                          vehiculo,
                        )
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <VehiculoDeleteDialog
        vehiculo={vehiculoAEliminar}
        open={Boolean(
          vehiculoAEliminar,
        )}
        onOpenChange={(open) => {
          if (!open) {
            setVehiculoAEliminar(null);
          }
        }}
        onSuccess={() => {
          setVehiculoAEliminar(null);
          onRefresh();
        }}
      />
    </>
  );
}