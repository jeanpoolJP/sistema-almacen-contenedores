"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

import type { Contenedor } from "../contenedores.types";

import { eliminarContenedor } from "../contenedores.actions";

import { Button } from "@/components/ui/button";

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

type ContenedorDeleteDialogProps = {
  contenedor: Contenedor | null;
  open: boolean;
  onOpenChange: (
    open: boolean,
  ) => void;
  onSuccess: () => void;
};

export function ContenedorDeleteDialog({
  contenedor,
  open,
  onOpenChange,
  onSuccess,
}: ContenedorDeleteDialogProps) {
  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleEliminar() {
    if (!contenedor) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result =
        await eliminarContenedor(
          contenedor.id,
        );

      if (!result.success) {
        setError(result.error);
        return;
      }

      onOpenChange(false);
      onSuccess();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Eliminar contenedor?
          </AlertDialogTitle>

          <AlertDialogDescription>
            Estás a punto de eliminar el
            contenedor{" "}
            <strong>
              {
                contenedor?.numeroContenedor
              }
            </strong>
            .
            <br />
            <br />
            Esta acción no se recomienda si
            el contenedor ya tiene guías
            asociadas.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3">
            <p className="text-sm text-destructive">
              {error}
            </p>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={loading}
          >
            Cancelar
          </AlertDialogCancel>

          <Button
            variant="destructive"
            disabled={loading}
            onClick={(event) => {
              event.preventDefault();
              handleEliminar();
            }}
          >
            {loading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 size-4" />
            )}

            Eliminar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}