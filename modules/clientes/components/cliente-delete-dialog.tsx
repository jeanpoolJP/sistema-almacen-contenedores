"use client";

import { useState } from "react";

import type { Cliente } from "../cliente.types";
import { desactivarCliente } from "../cliente.actions";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Loader2 } from "lucide-react";

type ClienteDeleteDialogProps = {
  cliente: Cliente | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function ClienteDeleteDialog({
  cliente,
  open,
  onOpenChange,
  onSuccess,
}: ClienteDeleteDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDesactivar() {
    if (!cliente) {
      return;
    }

    setLoading(true);
    setError("");

    const result = await desactivarCliente(
      cliente.id,
    );

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onSuccess();
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(value) => {
        if (!loading) {
          onOpenChange(value);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Desactivar cliente?
          </AlertDialogTitle>

          <AlertDialogDescription>
            El cliente{" "}
            <strong>
              {cliente?.nombreCompleto ?? "seleccionado"}
            </strong>{" "}
            será marcado como inactivo.

            <br />

            Su historial de guías y pagos se conservará.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <p className="text-sm text-destructive">
            {error}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Cancelar
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDesactivar}
            disabled={loading}
          >
            {loading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}

            Desactivar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}