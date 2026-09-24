// modules/guias/components/ingreso-guia/editar-guia-dialog.tsx
"use client"

import { useEffect, useState } from "react"
import { useForm, FormProvider, type FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

import type { GuiaConRelaciones } from "../guia-con-relaciones.type"
import { editarGuiaSchema } from "../../guia.schema"
import type { EditarGuiaInput, EditarGuiaSchema } from "../../guia.types"
import { editarGuiaAction } from "../../guia.actions"
import { obtenerConfiguracionPrecioAction } from "@/modules/configuracion/configuracion.actions"

import { GuiaIngresoForm } from "./guia-ingreso-form"

/**
 * Recorre el árbol de errores de react-hook-form y devuelve el primer
 * mensaje de validación encontrado, para mostrarlo en un toast.
 */
function obtenerPrimerMensaje(error: unknown): string | null {
  if (!error || typeof error !== "object") return null

  if (
    "message" in error &&
    typeof error.message === "string" &&
    error.message.length > 0
  ) {
    return error.message
  }

  for (const valor of Object.values(error)) {
    const mensaje = obtenerPrimerMensaje(valor)

    if (mensaje) return mensaje
  }

  return null
}

/**
 * Props del diálogo de edición de ingreso.
 *
 * El padre controla visibilidad (`open` / `onOpenChange`) porque el diálogo
 * se abre desde el menú de acciones de una fila, no desde un trigger interno.
 *
 * @property guia - Guía con relaciones (contenedor, transportista, vehículo, conductor).
 * @property onEditada - Se dispara tras guardar con éxito (p. ej. para recargar el listado).
 */
type EditarGuiaDialogProps = {
  guia: GuiaConRelaciones
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditada?: () => void
}

/**
 * Mapea la guía persistida al shape del formulario de edición.
 *
 * En `ESPACIO_ALQUILADO` no se envían precios diarios; se usa `precioIngresoSalida`.
 */
function obtenerValoresIniciales(guia: GuiaConRelaciones): EditarGuiaSchema {
  return {
    numeroGuia: guia.numeroGuia,
    contenedor: {
      numeroContenedor: guia.contenedor.numeroContenedor,
      marca: guia.contenedor.marca,
      medida: guia.contenedor.medida,
      tipo: guia.contenedor.tipo,
    },
    transportistaIngreso: {
      empresaNombre: guia.empresaTransporteIngreso.nombre,
      ruc: guia.empresaTransporteIngreso.ruc ?? "",
      telefono: guia.empresaTransporteIngreso.telefono ?? "",
      contactoLogistico: guia.empresaTransporteIngreso.contactoLogistico ?? "",
      nombreEncargado: guia.empresaTransporteIngreso.nombreEncargado ?? "",
      placa: guia.vehiculoIngreso.placa,
      conductorNombre: guia.conductorIngreso.nombreCompleto,
      numeroLicencia: guia.conductorIngreso.numeroLicencia,
    },
    fechaIngreso: guia.fechaIngreso,
    horaIngreso: guia.horaIngreso,
    tipoPrecio: guia.tipoPrecio,
    precioPrimerDia:
      guia.tipoPrecio === "ESPACIO_ALQUILADO"
        ? undefined
        : Number(guia.precioPrimerDia),
    precioDiaAdicional:
      guia.tipoPrecio === "ESPACIO_ALQUILADO"
        ? undefined
        : Number(guia.precioDiaAdicional),
    precioIngresoSalida:
      guia.precioIngresoSalida === null
        ? undefined
        : Number(guia.precioIngresoSalida),
    tratamientoIGV: guia.tratamientoIGV,
    observaciones: guia.observaciones ?? "",
  }
}

/**
 * Diálogo controlado para editar los datos de ingreso de una guía existente.
 *
 * Al abrirse resetea el formulario con la guía actual y carga los precios base
 * de configuración (útiles si el usuario cambia el tipo de precio a ESTANDAR).
 * El envío arma `EditarGuiaInput` (incluye `guiaId`) y llama a `editarGuiaAction`.
 * Si la validación falla, `onInvalidSubmit` muestra el primer error en un toast.
 */
export function EditarGuiaDialog({
  guia,
  open,
  onOpenChange,
  onEditada,
}: EditarGuiaDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const [precioBase, setPrecioBase] = useState<{
    precioPrimerDia: number
    precioDiaAdicional: number
  } | null>(null)

  const form = useForm<EditarGuiaSchema>({
    resolver: zodResolver(editarGuiaSchema),
    defaultValues: obtenerValoresIniciales(guia),
  })

  useEffect(() => {
    if (!open) return

    form.reset(obtenerValoresIniciales(guia))

    obtenerConfiguracionPrecioAction().then((res) => {
      if (!res.success || !res.data) return

      setPrecioBase({
        precioPrimerDia: Number(res.data.precioPrimerDia),
        precioDiaAdicional: Number(res.data.precioDiaAdicional),
      })
    })
  }, [form, guia, open])

  async function onSubmit(data: EditarGuiaSchema) {
    setSubmitting(true)

    const payload: EditarGuiaInput = {
      guiaId: guia.id,
      ...data,
    }
    const res = await editarGuiaAction(payload)

    setSubmitting(false)

    if (!res.success) {
      toast.error(res.message)
      return
    }

    toast.success(res.message)
    onOpenChange(false)
    onEditada?.()
  }

  function onInvalidSubmit(errors: FieldErrors<EditarGuiaSchema>) {
    const mensaje = obtenerPrimerMensaje(errors)

    toast.error(
      mensaje ?? "Revisa los datos obligatorios antes de guardar los cambios"
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1rem)] max-w-4xl overflow-hidden p-0 sm:w-[calc(100%-2rem)] lg:max-w-5xl">
        <DialogHeader className="border-b px-4 py-4 sm:px-6">
          <DialogTitle>Editar ingreso de la guía {guia.numeroGuia}</DialogTitle>
          <DialogDescription>
            Actualiza los datos registrados al momento del ingreso del
            contenedor.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] px-4 sm:px-6">
          <FormProvider {...form}>
            <GuiaIngresoForm
              formId="editar-guia-form"
              onSubmit={form.handleSubmit(onSubmit)}
              precioBase={precioBase}
              mostrarNumeroGuia
            />
          </FormProvider>
        </ScrollArea>

        <DialogFooter className="border-t px-4 py-4 sm:px-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={form.handleSubmit(onSubmit, onInvalidSubmit)}
            disabled={submitting}
            className="w-full sm:w-auto"
          >
            {submitting ? "Guardando..." : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
