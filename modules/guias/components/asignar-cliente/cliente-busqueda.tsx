// modules\guias\components\asignar-cliente\cliente-busqueda.tsx

"use client"

import { useState, useTransition } from "react"

import { Search, Loader2, CheckCircle2 } from "lucide-react"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  buscarClientePorDocumentoAction,
  obtenerClientesFrecuentesAction,
} from "@/modules/clientes/cliente.actions"

import type { ClienteEncontrado, ClienteFrecuente } from "./types"

type ClienteBusquedaProps = {
  clienteSeleccionado: ClienteEncontrado | null
  onSeleccionar: (cliente: ClienteEncontrado) => void
  onLimpiarSeleccion: () => void
  onDocumentoNoEncontrado: (documento: string) => void
}

export function ClienteBusqueda({
  clienteSeleccionado,
  onSeleccionar,
  onLimpiarSeleccion,
  onDocumentoNoEncontrado,
}: ClienteBusquedaProps) {
  const [documento, setDocumento] = useState("")
  const [clienteEncontrado, setClienteEncontrado] =
    useState<ClienteEncontrado | null>(null)

  const [frecuentes, setFrecuentes] = useState<ClienteFrecuente[]>([])

  const [busquedaRealizada, setBusquedaRealizada] = useState(false)

  const [isPending, startTransition] = useTransition()

  const [cargandoFrecuentes, startFrecuentes] = useTransition()

  function cargarFrecuentes() {
    startFrecuentes(async () => {
      const resultado = await obtenerClientesFrecuentesAction()

      if (!resultado.success) {
        toast.error(resultado.error)
        return
      }

      setFrecuentes(resultado.data ?? [])
    })
  }

  function buscarCliente() {
    const numeroDocumento = documento.trim()

    if (!numeroDocumento) {
      toast.error("Ingresa un número de documento")
      return
    }

    startTransition(async () => {
      const resultado = await buscarClientePorDocumentoAction(numeroDocumento)

      if (!resultado.success) {
        toast.error(resultado.error)
        setClienteEncontrado(null)
        setBusquedaRealizada(false)
        return
      }

      setBusquedaRealizada(true)

      if (!resultado.data) {
        setClienteEncontrado(null)
        onLimpiarSeleccion()
        onDocumentoNoEncontrado(numeroDocumento)
        return
      }

      if (!resultado.data.activo) {
        toast.error("El cliente está inactivo")
        setClienteEncontrado(null)
        onLimpiarSeleccion()
        return
      }

      setClienteEncontrado(resultado.data)
      onSeleccionar(resultado.data)
    })
  }

  function seleccionarFrecuente(cliente: ClienteFrecuente) {
    // Se consulta por ID para obtener el registro completo.
    // Así no dependemos de datos parciales del listado.
    startTransition(async () => {
      const resultado = await buscarClientePorDocumentoAction(
        cliente.numeroDocumento
      )

      if (!resultado.success || !resultado.data) {
        toast.error(resultado.error ?? "No se pudo obtener el cliente")
        return
      }

      if (!resultado.data.activo) {
        toast.error("El cliente está inactivo")
        return
      }

      setDocumento(cliente.numeroDocumento)
      setClienteEncontrado(resultado.data)
      setBusquedaRealizada(true)
      onSeleccionar(resultado.data)
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="documento-cliente">Buscar por DNI o RUC</Label>

        <div className="flex gap-2">
          <Input
            id="documento-cliente"
            value={documento}
            onChange={(event) => {
              setDocumento(event.target.value)
              setBusquedaRealizada(false)
            }}
            placeholder="Ingresa el documento"
            maxLength={11}
            disabled={isPending}
          />

          <Button
            type="button"
            onClick={buscarCliente}
            disabled={isPending || !documento.trim()}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
            Buscar
          </Button>
        </div>
      </div>

      {busquedaRealizada && !clienteEncontrado && (
        <div className="rounded-md border border-dashed p-3">
          <p className="text-sm font-medium">No se encontró un cliente</p>

          <p className="text-sm text-muted-foreground">
            Puedes registrar uno nuevo con este documento.
          </p>
        </div>
      )}

      {clienteEncontrado && (
        <div className="rounded-md border bg-muted/40 p-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 text-green-600" />

            <div className="min-w-0">
              <p className="font-medium">
                {clienteEncontrado.nombreCompleto || "Sin nombre"}
              </p>

              <p className="text-sm text-muted-foreground">
                {clienteEncontrado.tipoDocumento}{" "}
                {clienteEncontrado.numeroDocumento}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Clientes frecuentes</Label>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={cargarFrecuentes}
            disabled={cargandoFrecuentes}
          >
            {cargandoFrecuentes && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Cargar
          </Button>
        </div>

        {frecuentes.length > 0 ? (
          <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-2">
            {frecuentes.map((cliente) => (
              <button
                key={cliente.id}
                type="button"
                onClick={() => seleccionarFrecuente(cliente)}
                disabled={isPending}
                className="flex w-full items-center justify-between gap-3 rounded-md p-2 text-left hover:bg-muted disabled:opacity-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {cliente.nombreCompleto || "Sin nombre"}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {cliente.tipoDocumento} {cliente.numeroDocumento}
                  </p>
                </div>

                <span className="shrink-0 text-xs text-muted-foreground">
                  {cliente._count.guiasInternamiento} guías
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Carga los clientes frecuentes para seleccionarlos.
          </p>
        )}
      </div>
    </div>
  )
}
