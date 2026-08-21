"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { vehiculoSchema } from "../vehiculos.schema";
import type { VehiculoFormData } from "../vehiculos.types";

import {
  crearVehiculo,
  editarVehiculo,
} from "../vehiculos.actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type VehiculoFormProps = {
  vehiculo?: VehiculoFormData & {
    id?: number;
  };
  onSuccess?: () => void;
};

export function VehiculoForm({
  vehiculo,
  onSuccess,
}: VehiculoFormProps) {
  const esEdicion = Boolean(vehiculo?.id);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<VehiculoFormData>({
    resolver: zodResolver(vehiculoSchema),
    defaultValues: {
      placa: vehiculo?.placa ?? "",
    },
  });

  /**
   * Actualiza los valores del formulario
   * cuando cambia el vehículo seleccionado.
   */
  useEffect(() => {
    reset({
      placa: vehiculo?.placa ?? "",
    });
  }, [vehiculo, reset]);

  async function onSubmit(
    data: VehiculoFormData,
  ) {
    const result = esEdicion
      ? await editarVehiculo(
          vehiculo!.id!,
          data,
        )
      : await crearVehiculo(data);

    if (!result.success) {
      setError("root", {
        message: result.error,
      });

      return;
    }

    reset();

    onSuccess?.();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Placa */}
      <div className="space-y-2">
        <Label htmlFor="placa">
          Placa
        </Label>

        <Input
          id="placa"
          placeholder="ABC-123"
          maxLength={10}
          autoComplete="off"
          className="uppercase"
          {...register("placa")}
        />

        {errors.placa && (
          <p className="text-sm text-destructive">
            {errors.placa.message}
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          Ingresa la placa del vehículo.
        </p>
      </div>

      {/* Error general */}
      {errors.root && (
        <p className="text-sm text-destructive">
          {errors.root.message}
        </p>
      )}

      {/* Botón */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting && (
            <Loader2 className="mr-2 size-4 animate-spin" />
          )}

          {esEdicion
            ? "Actualizar vehículo"
            : "Registrar vehículo"}
        </Button>
      </div>
    </form>
  );
}