"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

import type { Conductor } from "../conductores.types";

import { eliminarConductor } from "../conductores.actions";

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

type ConductorDeleteDialogProps = {
  conductor: Conductor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function ConductorDeleteDialog({
  conductor,
  open,
  onOpenChange,
  onSuccess,
}: ConductorDeleteDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleEliminar() {
    if (!conductor) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await eliminarConductor(
        conductor.id,
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
      onOpenChange={(value) => {
        if (!loading) {
          setError("");
          onOpenChange(value);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Eliminar conductor?
          </AlertDialogTitle>

          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar al
            conductor{" "}
            <span className="font-medium text-foreground">
              {conductor?.nombreCompleto}
            </span>
            ? Esta acción eliminará el registro del
            conductor.
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
            onClick={(event) => {
              event.preventDefault();
              handleEliminar();
            }}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}

            {!loading && (
              <Trash2 className="mr-2 size-4" />
            )}

            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}