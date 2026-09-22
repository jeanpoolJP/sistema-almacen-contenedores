// modules\trasegados\components\crear-guia\crear-guia-trasegado-form.tsx

"use client"

import { PlusIcon, SaveIcon, Trash2Icon, TruckIcon } from "lucide-react"
import { FormProvider, useFieldArray } from "react-hook-form"

import { Button } from "@/components/ui/button"

import { SeccionInfoGeneral } from "./seccion-info-general"
import { SeccionTransporte } from "../shared/seccion-transporte" // 👈 cambia aquí
import { SeccionElementos } from "./seccion-elementos"
import { useCrearGuiaTrasegado } from "../../hooks/use-crear-guia-trasegado"
import { crearIngresoVacio } from "../../utils/form-defaults"

/**
 * Formulario completo para crear una guía de trasegado.
 */
export function CrearGuiaTrasegadoForm() {
  const { form, onSubmit, isPending } = useCrearGuiaTrasegado()
  const ingresos = useFieldArray({
    control: form.control,
    name: "ingresos",
    keyName: "_key",
  })

  return (
    <FormProvider {...form}>
      <form
        onSubmit={onSubmit}
        className="space-y-6"
        autoComplete="off"
        noValidate
      >
        <SeccionInfoGeneral form={form} />
        {ingresos.fields.map((field, index) => (
          <div key={field._key} className="space-y-4 rounded-xl border p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <TruckIcon className="size-4 text-muted-foreground" />
                <h2 className="font-semibold">Ingreso {index + 1}</h2>
              </div>

              {ingresos.fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => ingresos.remove(index)}
                  aria-label={`Eliminar ingreso ${index + 1}`}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              )}
            </div>

            <SeccionTransporte form={form} prefijo={`ingresos.${index}`} />
            <SeccionElementos form={form} ingresoIndex={index} />
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => ingresos.append(crearIngresoVacio())}
        >
          <PlusIcon className="mr-2 size-4" />
          Agregar otro ingreso
        </Button>
        <div className="flex items-center justify-end gap-3 border-t pt-6">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => form.reset()}
          >
            Limpiar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <span className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Guardando...
              </>
            ) : (
              <>
                <SaveIcon className="mr-2 size-4" />
                Crear guía
              </>
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
