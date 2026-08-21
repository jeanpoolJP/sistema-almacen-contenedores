"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { clienteSchema } from "../cliente.schema";
import type { ClienteFormData } from "../cliente.types";

import {
  buscarClientePorDni,
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
  const [buscandoDni, setBuscandoDni] = useState(false);
  const [mensajeDni, setMensajeDni] = useState("");

  const esEdicion = Boolean(cliente?.id);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    setError,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      dni: cliente?.dni ?? "",
      nombreCompleto: cliente?.nombreCompleto ?? "",
      telefono: cliente?.telefono ?? "",
      observaciones: cliente?.observaciones ?? "",
      activo: cliente?.activo ?? true,
    },
  });

  async function handleBuscarDni() {
    const dni = getValues("dni");

    if (!/^\d{8}$/.test(dni)) {
      setError("dni", {
        message: "Ingresa un DNI válido de 8 dígitos",
      });

      return;
    }

    setBuscandoDni(true);
    setMensajeDni("");

    const result = await buscarClientePorDni(dni);

    setBuscandoDni(false);

    if (!result.success) {
      setMensajeDni(result.error);
      return;
    }

    if (!result.data) {
      setMensajeDni(
        "No existe un cliente con este DNI. Puedes registrarlo.",
      );

      return;
    }

    if (esEdicion && result.data.id !== cliente?.id) {
      setError("dni", {
        message: "Este DNI pertenece a otro cliente.",
      });

      return;
    }

    setValue(
      "nombreCompleto",
      result.data.nombreCompleto ?? "",
    );

    setValue(
      "telefono",
      result.data.telefono ?? "",
    );

    setValue(
      "observaciones",
      result.data.observaciones ?? "",
    );

    setValue(
      "activo",
      result.data.activo,
    );

    setMensajeDni(
      "Cliente encontrado. Sus datos fueron cargados.",
    );
  }

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
      <div className="grid gap-6 md:grid-cols-2">
        {/* DNI */}
        <div className="space-y-2">
          <Label htmlFor="dni">
            DNI
          </Label>

          <div className="flex gap-2">
            <Input
              id="dni"
              maxLength={8}
              placeholder="12345678"
              disabled={buscandoDni}
              {...register("dni")}
            />

            <Button
              type="button"
              variant="outline"
              onClick={handleBuscarDni}
              disabled={buscandoDni}
            >
              {buscandoDni && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}

              Buscar
            </Button>
          </div>

          {errors.dni && (
            <p className="text-sm text-destructive">
              {errors.dni.message}
            </p>
          )}

          {mensajeDni && (
            <p className="text-sm text-muted-foreground">
              {mensajeDni}
            </p>
          )}
        </div>

        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="nombreCompleto">
            Nombre completo
          </Label>

          <Input
            id="nombreCompleto"
            placeholder="Nombre completo del cliente"
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
            {...register("telefono")}
          />

          {errors.telefono && (
            <p className="text-sm text-destructive">
              {errors.telefono.message}
            </p>
          )}
        </div>
      </div>

      {/* Observaciones */}
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