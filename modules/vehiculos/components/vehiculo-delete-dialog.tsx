"use client";

import { useState } from "react";
import { Loader2, TriangleAlert } from "lucide-react";

import type { Vehiculo } from "../vehiculos.types";
import { eliminarVehiculo } from "../vehiculos.actions";

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

type VehiculoDeleteDialogProps = {
  vehiculo: Vehiculo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function VehiculoDeleteDialog({
  vehiculo,
  open,
  onOpenChange,
  onSuccess,
}: VehiculoDeleteDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleEliminar() {
    if (!vehiculo) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result =
        await eliminarVehiculo(
          vehiculo.id,
        );

      if (!result.success) {
        setError(result.error);
        return;
      }

      onOpenChange(false);
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(
    value: boolean,
  ) {
    if (!value) {
      setError("");
    }

    onOpenChange(value);
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <TriangleAlert className="size-5 text-destructive" />

            Eliminar vehículo
          </AlertDialogTitle>

          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar
            el vehículo{" "}
            <strong className="text-foreground">
              {vehiculo?.placa}
            </strong>
            ?
            <br />
            <br />
            Si este vehículo ya fue utilizado en
            una guía, no podrá eliminarse para
            proteger el historial del sistema.
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

          <AlertDialogAction
            onClick={handleEliminar}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}

            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}