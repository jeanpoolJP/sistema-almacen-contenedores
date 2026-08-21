"use client";

import { useState } from "react";
import {
  Pencil,
  UserRound,
  UserX,
} from "lucide-react";

import type { Conductor } from "../conductores.types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ConductorDeleteDialog } from "./conductor-delete-dialog";

type ConductorTableProps = {
  conductores: Conductor[];
  onEdit: (conductor: Conductor) => void;
  onRefresh: () => void;
};

export function ConductorTable({
  conductores,
  onEdit,
  onRefresh,
}: ConductorTableProps) {
  const [
    conductorAEliminar,
    setConductorAEliminar,
  ] = useState<Conductor | null>(null);

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
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Conductor</TableHead>

              <TableHead>N.º de licencia</TableHead>

              <TableHead>Estado</TableHead>

              <TableHead className="text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {conductores.map((conductor) => (
              <TableRow key={conductor.id}>
                {/* Conductor */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-muted">
                      <UserRound className="size-4 text-muted-foreground" />
                    </div>

                    <div>
                      <p className="font-medium">
                        {conductor.nombreCompleto}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        ID #{conductor.id}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Licencia */}
                <TableCell>
                  <span className="font-medium">
                    {conductor.numeroLicencia}
                  </span>
                </TableCell>

                {/* Estado */}
                <TableCell>
                  <Badge>
                    Activo
                  </Badge>
                </TableCell>

                {/* Acciones */}
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Editar conductor"
                      onClick={() =>
                        onEdit(conductor)
                      }
                    >
                      <Pencil className="size-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      title="Desactivar conductor"
                      onClick={() =>
                        setConductorAEliminar(
                          conductor,
                        )
                      }
                    >
                      <UserX className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConductorDeleteDialog
        conductor={conductorAEliminar}
        open={Boolean(conductorAEliminar)}
        onOpenChange={(open) => {
          if (!open) {
            setConductorAEliminar(null);
          }
        }}
        onSuccess={() => {
          setConductorAEliminar(null);
          onRefresh();
        }}
      />
    </>
  );
}