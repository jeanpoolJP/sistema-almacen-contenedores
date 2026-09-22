// modules/trasegados/components/crear-guia/seccion-elementos.tsx
"use client"

import { PackageIcon } from "lucide-react"
import { useFieldArray, type UseFormReturn } from "react-hook-form"

import { ElementoFormCard } from "./elemento-form-card"
import { SelectorTipoElemento } from "./selector-tipo-elemento"
import { FormSection } from "../shared"
import { crearElementoVacio } from "../../utils/form-defaults"
import type { TipoElementoTrasegado } from "../../types"
import type { CrearGuiaTrasegadoInput } from "../../schemas/crear-guia-trasegado.schema"

interface SeccionElementosProps {
  form: UseFormReturn<CrearGuiaTrasegadoInput>
  ingresoIndex: number
}

/**
 * Sección dinámica que permite agregar/eliminar elementos
 * transportados (contenedores, flat racks, mercadería, maquinaria).
 */
export function SeccionElementos({
  form,
  ingresoIndex,
}: SeccionElementosProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `ingresos.${ingresoIndex}.elementos`,
    // Necesario cuando el array puede empezar vacío y usar
    // discriminated unions. Evita conflictos con el `id` de RHF.
    keyName: "_key",
  })

  const handleAdd = (tipo: TipoElementoTrasegado) => {
    append(crearElementoVacio(tipo))
  }

  // Error general del array (validación Zod)
  const errorElementos =
    form.formState.errors.ingresos?.[ingresoIndex]?.elementos
  const mensajeError = errorElementos?.message ?? errorElementos?.root?.message

  return (
    <FormSection
      title="Elementos transportados"
      description="Registra al menos un elemento. Puedes agregar varios."
      icon={<PackageIcon className="size-4" />}
    >
      <div className="space-y-4">
        {fields.length === 0 && (
          <div className="rounded-lg border border-dashed bg-muted/30 p-8 text-center">
            <PackageIcon className="mx-auto mb-2 size-8 text-muted-foreground/50" />
            <p className="text-sm font-medium">No hay elementos</p>
            <p className="text-xs text-muted-foreground">
              Agrega el primer elemento para continuar.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {fields.map((field, index) => (
            <ElementoFormCard
              key={field._key}
              form={form}
              index={index}
              ingresoIndex={ingresoIndex}
              tipo={field.tipo}
              onRemove={() => remove(index)}
              puedeEliminar={fields.length > 1}
            />
          ))}
        </div>

        {/* Error general del array (no va con FormMessage) */}
        {mensajeError && (
          <p className="text-sm font-medium text-destructive">{mensajeError}</p>
        )}

        <SelectorTipoElemento onSelect={handleAdd} />
      </div>
    </FormSection>
  )
}
