// modules\trasegados\components\registrar-salida\registrar-salida-form.tsx

"use client"

import { Loader2Icon } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"

import { SeccionInfoSalida } from "./seccion-info-salida"
import { SeccionElementosPendientes } from "./seccion-elementos-pendientes"
import { SeccionTransporte } from "../shared/seccion-transporte"
import type { RegistrarSalidaInput } from "../../schemas/registrar-salida.schema"
import type { ElementoPendienteSalida } from "../../types/registrar-salida.types"

interface RegistrarSalidaFormProps {
  form: UseFormReturn<RegistrarSalidaInput, any, RegistrarSalidaInput>
  onSubmit: (e?: React.BaseSyntheticEvent) => void
  isPending: boolean
  elementos: ElementoPendienteSalida[]
  cargandoElementos: boolean
  elementosSeleccionados: Set<number>
  onToggleElemento: (id: number) => void
  onSeleccionarTodos: () => void
  onLimpiarSeleccion: () => void
  onCancel: () => void
}

/**
 * Formulario completo de registrar salida.
 *
 * Usa la SeccionTransporte compartida con los campos a nivel raíz del
 * schema de salida: empresaTransporte, vehiculo y conductor.
 */
export function RegistrarSalidaForm({
  form,
  onSubmit,
  isPending,
  elementos,
  cargandoElementos,
  elementosSeleccionados,
  onToggleElemento,
  onSeleccionarTodos,
  onLimpiarSeleccion,
  onCancel,
}: RegistrarSalidaFormProps) {
  const errorElementos = form.formState.errors.elementosIds?.message?.toString()

  return (
    <Form {...form}>
      <form
        onSubmit={onSubmit}
        className="space-y-6"
        autoComplete="off"
        noValidate
      >
        <SeccionInfoSalida form={form} />

        <SeccionTransporte form={form} prefijo="" />

        <SeccionElementosPendientes
          elementos={elementos}
          cargando={cargandoElementos}
          seleccionados={elementosSeleccionados}
          onToggle={onToggleElemento}
          onSeleccionarTodos={onSeleccionarTodos}
          onLimpiarSeleccion={onLimpiarSeleccion}
          errorMessage={errorElementos}
        />

        <div className="flex items-center justify-end gap-3 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isPending || elementosSeleccionados.size === 0}
          >
            {isPending ? (
              <>
                <Loader2Icon className="mr-2 size-4 animate-spin" />
                Registrando...
              </>
            ) : (
              "Registrar salida"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
