// modules/guias/components/ingreso-guia/crear-guia-dialog.tsx
"use client"

import { useEffect, useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

import { crearGuiaSchema, type CrearGuiaSchema } from "../../guia.schema"
import { crearGuiaAction } from "../../guia.actions"
import { obtenerConfiguracionPrecioAction } from "@/modules/configuracion/configuracion.actions"

import { GuiaIngresoForm } from "./guia-ingreso-form"

/**
 * Props del diálogo de registro de ingreso.
 *
 * @property onCreada - Se dispara tras crear la guía con éxito (p. ej. para recargar el listado).
 */
type CrearGuiaDialogProps = {
  onCreada?: () => void
}

/**
 * Diálogo para registrar el ingreso de un contenedor (nueva guía).
 *
 * Al abrirse carga los precios base desde configuración y los aplica al formulario.
 * El envío llama a `crearGuiaAction`; si responde OK, muestra toast, resetea el form
 * y cierra el diálogo.
 */
export function CrearGuiaDialog({ onCreada }: CrearGuiaDialogProps) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [precioBase, setPrecioBase] = useState<{
    precioPrimerDia: number
    precioDiaAdicional: number
  } | null>(null)

  const form = useForm<CrearGuiaSchema>({
    resolver: zodResolver(crearGuiaSchema),
    defaultValues: {
      numeroGuia: "",
      contenedor: {
        numeroContenedor: "",
        marca: "",
        medida: undefined,
        tipo: "NORMAL",
      },
      transportistaIngreso: {
        empresaNombre: "",
        ruc: "",
        telefono: "",
        contactoLogistico: "",
        nombreEncargado: "",
        placa: "",
        conductorNombre: "",
        numeroLicencia: "",
      },
      fechaIngreso: undefined,
      horaIngreso: undefined,
      tipoPrecio: "ESTANDAR",
      precioPrimerDia: undefined,
      precioDiaAdicional: undefined,
      tratamientoIGV: "SIN_IGV",
      observaciones: "",
    },
  })

  useEffect(() => {
    if (!open) return

    obtenerConfiguracionPrecioAction().then((res) => {
      if (!res.success || !res.data) return

      const base = {
        precioPrimerDia: Number(res.data.precioPrimerDia),
        precioDiaAdicional: Number(res.data.precioDiaAdicional),
      }

      setPrecioBase(base)
      form.setValue("precioPrimerDia", base.precioPrimerDia)
      form.setValue("precioDiaAdicional", base.precioDiaAdicional)
    })
  }, [form, open])

  async function onSubmit(data: CrearGuiaSchema) {
    setSubmitting(true)
    const res = await crearGuiaAction(data)
    setSubmitting(false)

    if (!res.success) {
      toast.error(res.message)
      return
    }

    toast.success(res.message)
    form.reset()
    setOpen(false)
    onCreada?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <PlusCircle className="size-4" />
        Registrar guía
      </DialogTrigger>

      <DialogContent className="w-[calc(100%-1rem)] max-w-4xl overflow-hidden p-0 sm:w-[calc(100%-2rem)] lg:max-w-5xl">
        <DialogHeader className="border-b px-4 py-4 sm:px-6">
          <DialogTitle>Registrar ingreso de contenedor</DialogTitle>
          <DialogDescription>
            Completa los datos del cliente, el contenedor y el transportista que
            entrega.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] px-4 sm:px-6">
          <FormProvider {...form}>
            <GuiaIngresoForm
              formId="crear-guia-form"
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
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="crear-guia-form"
            disabled={submitting}
            className="w-full sm:w-auto"
          >
            {submitting ? "Guardando..." : "Registrar guía"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
