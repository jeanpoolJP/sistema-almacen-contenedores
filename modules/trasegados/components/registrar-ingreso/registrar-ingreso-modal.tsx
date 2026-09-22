"use client"

import { useTransition } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SaveIcon } from "lucide-react"
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

import { SeccionTransporte } from "../shared/seccion-transporte"
import { SeccionElementos } from "../crear-guia/seccion-elementos"
import { crearIngresoVacio } from "../../utils/form-defaults"
import {
  crearGuiaTrasegadoSchema,
  type CrearGuiaTrasegadoInput,
} from "../../schemas/crear-guia-trasegado.schema"
import { registrarIngresoAction } from "../../actions/registrar-ingreso.action"

type RegistrarIngresoModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  guiaId: number
  numeroGuia: string
  onSuccess: () => void
}

export function RegistrarIngresoModal({
  open,
  onOpenChange,
  guiaId,
  numeroGuia,
  onSuccess,
}: RegistrarIngresoModalProps) {
  const [isPending, startTransition] = useTransition()
  const form = useForm<CrearGuiaTrasegadoInput>({
    resolver: zodResolver(crearGuiaTrasegadoSchema),
    defaultValues: {
      numeroGuia: "000000",
      descripcionServicio: "",
      clienteId: null,
      fechaIngreso: new Date(),
      observaciones: "",
      ingresos: [crearIngresoVacio()],
    },
  })

  function cerrar() {
    if (!isPending) onOpenChange(false)
  }

  const onSubmit = form.handleSubmit((data) => {
    startTransition(async () => {
      const resultado = await registrarIngresoAction({
        guiaTrasegadoId: guiaId,
        ingreso: data.ingresos[0],
      })

      if (!resultado.success) {
        toast.error(resultado.message)
        return
      }

      toast.success(resultado.message)
      form.reset({ ...form.getValues(), ingresos: [crearIngresoVacio()] })
      onOpenChange(false)
      onSuccess()
    })
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Registrar nuevo ingreso</DialogTitle>
          <DialogDescription>
            Agrega un nuevo ingreso a la guía {numeroGuia}. El cliente y el pago
            pertenecen a la guía y no se modifican aquí.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={onSubmit} className="space-y-6" noValidate>
            <div className="rounded-xl border p-4">
              <SeccionTransporte form={form} prefijo="ingresos.0" />
              <SeccionElementos form={form} ingresoIndex={0} />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={cerrar}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <span className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <SaveIcon className="mr-2 size-4" />
                )}
                Registrar ingreso
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
