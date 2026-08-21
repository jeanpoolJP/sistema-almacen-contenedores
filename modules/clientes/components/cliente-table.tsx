"use client";

import { useState } from "react";
import type { Cliente } from "../cliente.types";

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

import { Pencil, UserX } from "lucide-react";

import { ClienteDeleteDialog } from "./cliente-delete-dialog";

type ClienteTableProps = {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onRefresh: () => void;
};

export function ClienteTable({
  clientes,
  onEdit,
  onRefresh,
}: ClienteTableProps) {
  const [clienteAEliminar, setClienteAEliminar] =
    useState<Cliente | null>(null);

  if (clientes.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No hay clientes registrados.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>DNI</TableHead>
              <TableHead>Nombre completo</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {clientes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell className="font-medium">
                  {cliente.dni ?? "—"}
                </TableCell>

                <TableCell>
                  {cliente.nombreCompleto ?? "—"}
                </TableCell>

                <TableCell>
                  {cliente.telefono ?? "—"}
                </TableCell>

                <TableCell>
                  {cliente.activo ? (
                    <Badge>Activo</Badge>
                  ) : (
                    <Badge variant="secondary">
                      Inactivo
                    </Badge>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(cliente)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    {cliente.activo && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setClienteAEliminar(cliente)
                        }
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ClienteDeleteDialog
        cliente={clienteAEliminar}
        open={Boolean(clienteAEliminar)}
        onOpenChange={(open) => {
          if (!open) {
            setClienteAEliminar(null);
          }
        }}
        onSuccess={() => {
          setClienteAEliminar(null);
          onRefresh();
        }}
      />
    </>
  );
}