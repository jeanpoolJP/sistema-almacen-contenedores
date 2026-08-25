// modules/guias/components/fields/contenedor-field.tsx

"use client";

import { useState, useTransition } from "react";
import { useFormContext } from "react-hook-form";
import { CheckCircle2, Loader2, PackagePlus } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";

import { buscarContenedorPorNumeroAction } from "../../guia.lookup.actions";

type EstadoBusqueda = "idle" | "buscando" | "existente" | "nuevo";

/**
 * Sección "Contenedor" del formulario de creación de guía.
 * Al perder foco el número de contenedor, busca si ya está
 * registrado; si existe autocompleta marca/medida/tipo (de solo
 * lectura), si no, permite registrarlo como contenedor nuevo.
 */
export function ContenedorField() {
  const { control, setValue } = useFormContext();
  const [estado, setEstado] = useState<EstadoBusqueda>("idle");
  const [isPending, startTransition] = useTransition();

  const soloLectura = estado === "existente";

  async function handleBlurNumero(numero: string) {
    const limpio = numero.trim().toUpperCase();

    if (!limpio) {
      setEstado("idle");
      return;
    }

    setEstado("buscando");

    startTransition(() => {
      buscarContenedorPorNumeroAction(limpio).then((res) => {
        if (res.encontrado && res.data) {
          setValue("contenedor.marca", res.data.marca, {
            shouldValidate: true,
          });
          setValue("contenedor.medida", res.data.medida, {
            shouldValidate: true,
          });
          setValue("contenedor.tipo", res.data.tipo, {
            shouldValidate: true,
          });
          setEstado("existente");
        } else {
          setEstado("nuevo");
        }
      });
    });
  }

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="contenedor.numeroContenedor"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de contenedor</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  placeholder="Ej: MSCU1234567"
                  className="uppercase"
                  onChange={(e) =>
                    field.onChange(e.target.value.toUpperCase())
                  }
                  onBlur={(e) => {
                    field.onBlur();
                    handleBlurNumero(e.target.value);
                  }}
                />
                {isPending && (
                  <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {estado === "existente" && (
        <Badge
          variant="outline"
          className="gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700"
        >
          <CheckCircle2 className="size-3.5" />
          Contenedor ya registrado
        </Badge>
      )}
      {estado === "nuevo" && (
        <Badge
          variant="outline"
          className="gap-1.5 border-amber-200 bg-amber-50 text-amber-700"
        >
          <PackagePlus className="size-3.5" />
          Contenedor nuevo, se registrará
        </Badge>
      )}

      <div className="grid grid-cols-3 gap-3">
        <FormField
          control={control}
          name="contenedor.marca"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Marca</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  readOnly={soloLectura}
                  className={soloLectura ? "bg-muted" : undefined}
                  placeholder="Ej: Maersk"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

<FormField
  control={control}
  name="contenedor.medida"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Medida</FormLabel>

      <Select
        onValueChange={(value) =>
          field.onChange(Number(value))
        }
        value={
          field.value !== undefined &&
          field.value !== null
            ? String(field.value)
            : undefined
        }
        disabled={soloLectura}
      >
        <FormControl>
          <SelectTrigger
            className={
              soloLectura
                ? "bg-muted"
                : undefined
            }
          >
            <SelectValue placeholder="20 o 40" />
          </SelectTrigger>
        </FormControl>

        <SelectContent>
          <SelectItem value="20">
            20 
          </SelectItem>

          <SelectItem value="40">
            40 
          </SelectItem>
        </SelectContent>
      </Select>

      <FormMessage />
    </FormItem>
  )}
/>

        <FormField
          control={control}
          name="contenedor.tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={soloLectura}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="REEFER">Reefer</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
