"use client";

import { useState } from "react";
import {
  Box,
  Pencil,
  Trash2,
} from "lucide-react";

import type { Contenedor } from "../contenedores.types";

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

import { ContenedorDeleteDialog } from "./contenedor-delete-dialog";

type ContenedorTableProps = {
  contenedores: Contenedor[];
  onEdit: (
    contenedor: Contenedor,
  ) => void;
  onRefresh: () => void;
};

export function ContenedorTable({
  contenedores,
  onEdit,
  onRefresh,
}: ContenedorTableProps) {
  const [
    contenedorAEliminar,
    setContenedorAEliminar,
  ] = useState<Contenedor | null>(null);

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

  return (
    <>
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
                  key={contenedor.id}
                >
                  {/* Número */}
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

                  {/* Marca */}
                  <TableCell>
                    {contenedor.marca}
                  </TableCell>

                  {/* Medida */}
                  <TableCell>
                    <Badge variant="outline">
                      {contenedor.medida} pies
                    </Badge>
                  </TableCell>

                  {/* Tipo */}
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

                  {/* Acciones */}
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

                      <Button
                        variant="ghost"
                        size="icon"
                        title="Eliminar contenedor"
                        onClick={() =>
                          setContenedorAEliminar(
                            contenedor,
                          )
                        }
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ),
            )}
          </TableBody>
        </Table>
      </div>

      <ContenedorDeleteDialog
        contenedor={
          contenedorAEliminar
        }
        open={Boolean(
          contenedorAEliminar,
        )}
        onOpenChange={(open) => {
          if (!open) {
            setContenedorAEliminar(
              null,
            );
          }
        }}
        onSuccess={() => {
          setContenedorAEliminar(
            null,
          );

          onRefresh();
        }}
      />
    </>
  );
}