"use client";

import {
  CheckCircle2,
  Edit,
  MoreHorizontal,
  Power,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { cambiarEstadoEmpresaTransporteAction } from "../empresa-transporte.actions";
import type { EmpresaTransporte } from "../empresa-transporte.types";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type EmpresaTransporteTableProps = {
  empresas: EmpresaTransporte[];
  onEdit: (empresa: EmpresaTransporte) => void;
  onRefresh: () => void;
};

export function EmpresaTransporteTable({
  empresas,
  onEdit,
  onRefresh,
}: EmpresaTransporteTableProps) {
  async function handleCambiarEstado(
    empresa: EmpresaTransporte
  ) {
    const nuevoEstado = !empresa.activo;

    const mensaje = nuevoEstado
      ? "¿Activar esta empresa de transporte?"
      : "¿Desactivar esta empresa de transporte?";

    const confirmado = window.confirm(mensaje);

    if (!confirmado) {
      return;
    }

    try {
      const resultado =
        await cambiarEstadoEmpresaTransporteAction({
          id: empresa.id,
          activo: nuevoEstado,
        });

      if (!resultado.success) {
        toast.error(resultado.message);
        return;
      }

      toast.success(resultado.message);

      onRefresh();
    } catch (error) {
      console.error(error);

      toast.error(
        "No se pudo cambiar el estado de la empresa"
      );
    }
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              Empresa
            </TableHead>

            <TableHead>
              RUC
            </TableHead>

            <TableHead>
              Teléfono
            </TableHead>

            <TableHead>
              Estado
            </TableHead>

            <TableHead className="w-[70px] text-right">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {empresas.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-muted-foreground"
              >
                No se encontraron empresas de transporte.
              </TableCell>
            </TableRow>
          ) : (
            empresas.map((empresa) => (
              <TableRow key={empresa.id}>
                {/* EMPRESA */}

                <TableCell className="font-medium">
                  {empresa.nombre}
                </TableCell>

                {/* RUC */}

                <TableCell>
                  {empresa.ruc || "-"}
                </TableCell>

                {/* TELÉFONO */}

                <TableCell>
                  {empresa.telefono || "-"}
                </TableCell>

                {/* ESTADO */}

                <TableCell>
                  {empresa.activo ? (
                    <Badge variant="default">
                      <CheckCircle2 className="mr-1 size-3.5" />

                      Activo
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="mr-1 size-3.5" />

                      Inactivo
                    </Badge>
                  )}
                </TableCell>

                {/* ACCIONES */}

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
                    >
                      <MoreHorizontal className="size-4" />

                      <span className="sr-only">
                        Abrir acciones
                      </span>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          onEdit(empresa)
                        }
                      >
                        <Edit className="mr-2 size-4" />

                        Editar
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() =>
                          handleCambiarEstado(
                            empresa
                          )
                        }
                      >
                        <Power className="mr-2 size-4" />

                        {empresa.activo
                          ? "Desactivar"
                          : "Activar"}
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
  );
}