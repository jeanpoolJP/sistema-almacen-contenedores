"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { clienteSchema } from "../cliente.schema";
import type { ClienteFormData } from "../cliente.types";

import {
  crearCliente,
  editarCliente,
} from "../cliente.actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ClienteFormProps = {
  cliente?: ClienteFormData & {
    id?: number;
  };
  onSuccess?: () => void;
};

export function ClienteForm({
  cliente,
  onSuccess,
}: ClienteFormProps) {
  const esEdicion = Boolean(cliente?.id);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      tipoDocumento: cliente?.tipoDocumento ?? "DNI",
      numeroDocumento:
        cliente?.numeroDocumento ?? "",
      nombreCompleto:
        cliente?.nombreCompleto ?? "",
      telefono:
        cliente?.telefono ?? "",
      observaciones:
        cliente?.observaciones ?? "",
      activo:
        cliente?.activo ?? true,
    },
  });

  async function onSubmit(data: ClienteFormData) {
    const result = esEdicion
      ? await editarCliente(cliente!.id!, data)
      : await crearCliente(data);

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
      {/* =====================================================
          DOCUMENTO
      ====================================================== */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Tipo de documento */}
        <div className="space-y-2">
          <Label htmlFor="tipoDocumento">
            Tipo de documento
          </Label>

          <select
            id="tipoDocumento"
            {...register("tipoDocumento")}
            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <option value="DNI">
              DNI
            </option>

            <option value="RUC">
              RUC
            </option>
          </select>

          {errors.tipoDocumento && (
            <p className="text-sm text-destructive">
              {errors.tipoDocumento.message}
            </p>
          )}
        </div>

        {/* Número de documento */}
        <div className="space-y-2">
          <Label htmlFor="numeroDocumento">
            Número de documento
          </Label>

          <Input
            id="numeroDocumento"
            placeholder="12345678"
            inputMode="numeric"
            maxLength={11}
            {...register("numeroDocumento")}
          />

          {errors.numeroDocumento && (
            <p className="text-sm text-destructive">
              {errors.numeroDocumento.message}
            </p>
          )}
        </div>

        {/* Nombre completo */}
        <div className="space-y-2">
          <Label htmlFor="nombreCompleto">
            Nombre / Razón social
          </Label>

          <Input
            id="nombreCompleto"
            placeholder="Nombre completo o razón social"
            {...register("nombreCompleto")}
          />

          {errors.nombreCompleto && (
            <p className="text-sm text-destructive">
              {errors.nombreCompleto.message}
            </p>
          )}
        </div>

        {/* Teléfono */}
        <div className="space-y-2">
          <Label htmlFor="telefono">
            Teléfono
          </Label>

          <Input
            id="telefono"
            placeholder="987654321"
            inputMode="tel"
            {...register("telefono")}
          />

          {errors.telefono && (
            <p className="text-sm text-destructive">
              {errors.telefono.message}
            </p>
          )}
        </div>
      </div>

      {/* =====================================================
          OBSERVACIONES
      ====================================================== */}
      <div className="space-y-2">
        <Label htmlFor="observaciones">
          Observaciones
        </Label>

        <Textarea
          id="observaciones"
          placeholder="Observaciones del cliente..."
          className="min-h-24 resize-none"
          {...register("observaciones")}
        />

        {errors.observaciones && (
          <p className="text-sm text-destructive">
            {errors.observaciones.message}
          </p>
        )}
      </div>

      {/* =====================================================
          ACTIVO
      ====================================================== */}

      {esEdicion && (
        <div className="flex items-center gap-2">
          <input
            id="activo"
            type="checkbox"
            {...register("activo")}
            className="size-4 rounded border-input"
          />

          <Label
            htmlFor="activo"
            className="cursor-pointer"
          >
            Cliente activo
          </Label>
        </div>
      )}

      {/* =====================================================
          ERROR GENERAL
      ====================================================== */}

      {errors.root && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3">
          <p className="text-sm text-destructive">
            {errors.root.message}
          </p>
        </div>
      )}

      {/* =====================================================
          BOTONES
      ====================================================== */}

      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}

          {esEdicion
            ? "Actualizar cliente"
            : "Registrar cliente"}
        </Button>
      </div>
    </form>
  );
}