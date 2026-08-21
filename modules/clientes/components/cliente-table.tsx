// modules/clientes/components/cliente-table.tsx

"use client";

import { useState } from "react";
import {
  Building2,
  Pencil,
  User,
  UserX,
} from "lucide-react";

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
  const [
    clienteAEliminar,
    setClienteAEliminar,
  ] = useState<Cliente | null>(null);

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
                cliente.tipoDocumento === "RUC";

              return (
                <TableRow key={cliente.id}>
                  {/* =====================================================
                      DOCUMENTO
                  ====================================================== */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {esEmpresa ? (
                        <Building2 className="size-4 text-muted-foreground" />
                      ) : (
                        <User className="size-4 text-muted-foreground" />
                      )}

                      <div>
                        <p className="font-medium">
                          {cliente.numeroDocumento}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {cliente.tipoDocumento}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* =====================================================
                      CLIENTE
                  ====================================================== */}
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {cliente.nombreCompleto ?? "—"}
                      </p>

                      {cliente.observaciones && (
                        <p className="max-w-sm truncate text-xs text-muted-foreground">
                          {cliente.observaciones}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  {/* =====================================================
                      TELÉFONO
                  ====================================================== */}
                  <TableCell>
                    {cliente.telefono ?? "—"}
                  </TableCell>

                  {/* =====================================================
                      ESTADO
                  ====================================================== */}
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

                  {/* =====================================================
                      ACCIONES
                  ====================================================== */}
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Editar cliente"
                        onClick={() =>
                          onEdit(cliente)
                        }
                      >
                        <Pencil className="size-4" />
                      </Button>

                      {cliente.activo && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Desactivar cliente"
                          onClick={() =>
                            setClienteAEliminar(
                              cliente,
                            )
                          }
                        >
                          <UserX className="size-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* =====================================================
          DIÁLOGO DESACTIVAR CLIENTE
      ====================================================== */}
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