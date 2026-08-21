"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { contenedorSchema } from "../contenedores.schema";
import type {
  ContenedorFormData,
} from "../contenedores.types";

import {
  crearContenedor,
  editarContenedor,
} from "../contenedores.actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ContenedorFormProps = {
  contenedor?: ContenedorFormData & {
    id?: number;
  };
  onSuccess?: () => void;
};

export function ContenedorForm({
  contenedor,
  onSuccess,
}: ContenedorFormProps) {
  const esEdicion = Boolean(contenedor?.id);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    setError,
    watch,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<ContenedorFormData>({
    resolver: zodResolver(contenedorSchema),

    defaultValues: {
      numeroContenedor:
        contenedor?.numeroContenedor ?? "",

      marca:
        contenedor?.marca ?? "",

      medida:
        contenedor?.medida ?? 20,

      tipo:
        contenedor?.tipo ?? "NORMAL",
    },
  });

  /**
   * Actualiza el formulario cuando cambia
   * el contenedor seleccionado.
   */
  useEffect(() => {
    reset({
      numeroContenedor:
        contenedor?.numeroContenedor ?? "",

      marca:
        contenedor?.marca ?? "",

      medida:
        contenedor?.medida ?? 20,

      tipo:
        contenedor?.tipo ?? "NORMAL",
    });
  }, [contenedor, reset]);

  const medida = watch("medida");
  const tipo = watch("tipo");

  async function onSubmit(
    data: ContenedorFormData,
  ) {
    const result = esEdicion
      ? await editarContenedor(
          contenedor!.id!,
          data,
        )
      : await crearContenedor(data);

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
          INFORMACIÓN DEL CONTENEDOR
      ====================================================== */}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Número */}
        <div className="space-y-2">
          <Label htmlFor="numeroContenedor">
            Número de contenedor
          </Label>

          <Input
            id="numeroContenedor"
            placeholder="MSCU1234567"
            maxLength={20}
            autoComplete="off"
            {...register("numeroContenedor")}
          />

          {errors.numeroContenedor && (
            <p className="text-sm text-destructive">
              {
                errors.numeroContenedor
                  .message
              }
            </p>
          )}
        </div>

        {/* Marca */}
        <div className="space-y-2">
          <Label htmlFor="marca">
            Marca
          </Label>

          <Input
            id="marca"
            placeholder="Maersk"
            maxLength={100}
            {...register("marca")}
          />

          {errors.marca && (
            <p className="text-sm text-destructive">
              {errors.marca.message}
            </p>
          )}
        </div>

        {/* Medida */}
        <div className="space-y-2">
          <Label>
            Medida
          </Label>

          <Select
            value={String(medida)}
            onValueChange={(value) => {
              setValue(
                "medida",
                Number(value) as 20 | 40,
                {
                  shouldValidate: true,
                },
              );
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar medida" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="20">
                20 pies
              </SelectItem>

              <SelectItem value="40">
                40 pies
              </SelectItem>
            </SelectContent>
          </Select>

          {errors.medida && (
            <p className="text-sm text-destructive">
              {errors.medida.message}
            </p>
          )}
        </div>

        {/* Tipo */}
        <div className="space-y-2">
          <Label>
            Tipo
          </Label>

          <Select
            value={tipo}
            onValueChange={(value) => {
              setValue(
                "tipo",
                value as "NORMAL" | "REEFER",
                {
                  shouldValidate: true,
                },
              );
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="NORMAL">
                Normal
              </SelectItem>

              <SelectItem value="REEFER">
                Reefer
              </SelectItem>
            </SelectContent>
          </Select>

          {errors.tipo && (
            <p className="text-sm text-destructive">
              {errors.tipo.message}
            </p>
          )}
        </div>
      </div>

      {/* =====================================================
          ERROR GENERAL
      ====================================================== */}

      {errors.root && (
        <p className="text-sm text-destructive">
          {errors.root.message}
        </p>
      )}

      {/* =====================================================
          BOTÓN
      ====================================================== */}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting && (
            <Loader2 className="mr-2 size-4 animate-spin" />
          )}

          {esEdicion
            ? "Actualizar contenedor"
            : "Registrar contenedor"}
        </Button>
      </div>
    </form>
  );
}