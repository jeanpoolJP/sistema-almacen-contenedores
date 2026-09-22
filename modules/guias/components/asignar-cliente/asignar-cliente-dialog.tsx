// modules\guias\components\asignar-cliente\asignar-cliente-dialog.tsx

"use client"

import { useState, useTransition } from "react"

import { Loader2, UserPlus } from "lucide-react"

import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"

import { ClienteBusqueda } from "./cliente-busqueda"
import { AsignarClienteForm } from "./asignar-cliente-form"

import { asignarOActualizarClienteGuiaAction } from "@/modules/guias/guia.actions"

import type { ClienteEncontrado, AsignarClienteDialogProps } from "./types"

import type { ClienteFormData } from "@/modules/clientes/cliente.types"

type ModoFormulario = "seleccionar" | "nuevo"

export function AsignarClienteDialog({
  guiaId,
  numeroGuia,
  clienteActual,
  open,
  onOpenChange,
  onAsignada,
}: AsignarClienteDialogProps) {
  const [modo, setModo] = useState<ModoFormulario>("seleccionar")

  const [clienteSeleccionado, setClienteSeleccionado] =
    useState<ClienteEncontrado | null>(null)

  const [documentoNuevo, setDocumentoNuevo] = useState("")

  const [isPending, startTransition] = useTransition()

  function resetearModal() {
    setClienteSeleccionado(null)
    setDocumentoNuevo("")
    setModo("seleccionar")
  }

  function cerrarModal() {
    if (isPending) return

    onOpenChange(false)
    resetearModal()
  }

  function registrarNuevoDesdeBusqueda() {
    setDocumentoNuevo("")
    setModo("nuevo")
    setClienteSeleccionado(null)
  }

  function asignarClienteExistente() {
    if (!clienteSeleccionado) {
      toast.error("Selecciona un cliente")
      return
    }

    startTransition(async () => {
      const resultado = await asignarOActualizarClienteGuiaAction({
        guiaId,
        clienteId: clienteSeleccionado.id,
      })

      if (!resultado.success) {
        toast.error(resultado.error)
        return
      }

      toast.success(`Cliente asignado a la guía ${numeroGuia}`)

      resetearModal()
      onOpenChange(false)
      onAsignada()
    })
  }

  function crearYAsignarCliente(datos: ClienteFormData) {
    const nombreCompleto = datos.nombreCompleto?.trim()

    if (!nombreCompleto) {
      toast.error("El nombre o razón social es obligatorio")
      return
    }

    startTransition(async () => {
      const resultado = await asignarOActualizarClienteGuiaAction({
        guiaId,
        nuevoCliente: {
          tipoDocumento: datos.tipoDocumento,
          numeroDocumento: datos.numeroDocumento,
          nombreCompleto,
          telefono: datos.telefono,
          observaciones: datos.observaciones,
        },
      })

      if (!resultado.success) {
        toast.error(resultado.error)
        return
      }

      toast.success(`Cliente registrado y asignado a la guía ${numeroGuia}`)

      resetearModal()
      onOpenChange(false)
      onAsignada()
    })
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (nextOpen) onOpenChange(true)
          else cerrarModal()
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {clienteActual ? "Cambiar cliente" : "Asignar cliente"}
            </DialogTitle>

            <DialogDescription>
              Guía de internamiento {numeroGuia}. Selecciona un cliente
              existente o registra uno nuevo.
            </DialogDescription>
          </DialogHeader>

          {modo === "seleccionar" ? (
            <div className="space-y-4">
              {clienteActual && (
                <div className="rounded-md border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">
                    Cliente actualmente asignado
                  </p>

                  <p className="font-medium">
                    {clienteActual.nombreCompleto || "Sin nombre"}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {clienteActual.tipoDocumento}{" "}
                    {clienteActual.numeroDocumento}
                  </p>
                </div>
              )}

              <ClienteBusqueda
                clienteSeleccionado={clienteSeleccionado}
                onSeleccionar={setClienteSeleccionado}
                onLimpiarSeleccion={() => setClienteSeleccionado(null)}
                onDocumentoNoEncontrado={setDocumentoNuevo}
              />

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={registrarNuevoDesdeBusqueda}
                disabled={isPending}
              >
                <UserPlus className="mr-2 size-4" />
                Registrar cliente nuevo
              </Button>
            </div>
          ) : (
            <AsignarClienteForm
              documentoInicial={documentoNuevo}
              disabled={isPending}
              onSubmit={crearYAsignarCliente}
            />
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={cerrarModal}
              disabled={isPending}
            >
              Cancelar
            </Button>

            {modo === "seleccionar" ? (
              <Button
                type="button"
                onClick={asignarClienteExistente}
                disabled={isPending || !clienteSeleccionado}
              >
                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Asignar cliente
              </Button>
            ) : (
              <Button
                type="button"
                disabled={isPending}
                onClick={() => {
                  toast.info(
                    "Completa el formulario y presiona Registrar cliente"
                  )
                }}
              >
                Registrar cliente
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
