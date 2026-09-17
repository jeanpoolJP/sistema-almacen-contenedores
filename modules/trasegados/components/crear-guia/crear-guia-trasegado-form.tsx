// modules\trasegados\components\crear-guia\crear-guia-trasegado-form.tsx

"use client"

import { SaveIcon } from "lucide-react"
import { FormProvider } from "react-hook-form"

import { Button } from "@/components/ui/button"

import { SeccionInfoGeneral } from "./seccion-info-general"
import { SeccionTransporte } from "./seccion-transporte"
import { SeccionElementos } from "./seccion-elementos"
import { useCrearGuiaTrasegado } from "../../hooks/use-crear-guia-trasegado"

/**
 * Formulario completo para crear una guía de trasegado.
 *
 * Compone las secciones de información general, transporte
 * y elementos transportados, y delega el submit al hook.
 */
export function CrearGuiaTrasegadoForm() {
  const { form, onSubmit, isPending } = useCrearGuiaTrasegado()

  return (
    <FormProvider {...form}>
      <form
        onSubmit={onSubmit}
        className="space-y-6"
        autoComplete="off"
        noValidate
      >
        <SeccionInfoGeneral form={form} />
        <SeccionTransporte form={form} />
        <SeccionElementos form={form} />

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
