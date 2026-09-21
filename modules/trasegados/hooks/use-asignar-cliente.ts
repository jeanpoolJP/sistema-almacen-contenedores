// modules\trasegados\hooks\use-asignar-cliente.ts

"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useCallback, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { asignarClienteAction } from "../actions/asignar-cliente.action"
import {
  asignarClienteSchema,
  type AsignarClienteInput,
} from "../schemas/asignar-cliente.schema"
import { buscarClienteAction } from "../actions/buscar-entidades.action"

interface UseAsignarClienteOptions {
  guiaId: number
  onSuccess?: () => void
}

/**
 * Hook que encapsula:
 * - El form del modal de asignar cliente.
 * - La búsqueda por número de documento.
 * - El estado "encontrado → bloquear" / "no encontrado → permitir crear".
 * - El submit contra el server action.
 */
export function useAsignarCliente({
  guiaId,
  onSuccess,
}: UseAsignarClienteOptions) {
  const [isPending, startTransition] = useTransition()
  const [buscando, setBuscando] = useState(false)
  const [clienteEncontrado, setClienteEncontrado] = useState<{
    id: number
    tipoDocumento: string
    numeroDocumento: string
    nombreCompleto: string | null
    telefono: string | null
    observaciones: string | null
  } | null>(null)

  const form = useForm<AsignarClienteInput, any, AsignarClienteInput>({
    resolver: zodResolver(asignarClienteSchema as any),
    defaultValues: {
      guiaTrasegadoId: guiaId,
      clienteId: null,
      tipoDocumento: "RUC",
      numeroDocumento: "",
      nombreCompleto: "",
      telefono: "",
      observaciones: "",
    },
    mode: "onBlur",
  })

  const resetForm = useCallback(() => {
    form.reset({
      guiaTrasegadoId: guiaId,
      clienteId: null,
      tipoDocumento: "RUC",
      numeroDocumento: "",
      nombreCompleto: "",
      telefono: "",
      observaciones: "",
    })
    setClienteEncontrado(null)
  }, [form, guiaId])

  // ------------------ BÚSQUEDA ------------------
  const buscarPorDocumento = useCallback(
    async (numeroDocumento: string) => {
      const doc = numeroDocumento.trim()
      if (!doc) {
        setClienteEncontrado(null)
        form.setValue("clienteId", null)
        return
      }

      setBuscando(true)
      try {
        const res = await buscarClienteAction(doc)

        if (res.found) {
          setClienteEncontrado(res.data)
          form.setValue("clienteId", res.data.id)
          form.setValue(
            "tipoDocumento",
            res.data.tipoDocumento as "DNI" | "RUC"
          )
          form.setValue("numeroDocumento", res.data.numeroDocumento)
          form.setValue("nombreCompleto", res.data.nombreCompleto ?? "")
          form.setValue("telefono", res.data.telefono ?? "")
          form.setValue("observaciones", res.data.observaciones ?? "")
        } else {
          setClienteEncontrado(null)
          form.setValue("clienteId", null)
        }
      } finally {
        setBuscando(false)
      }
    },
    [form]
  )

  const limpiarBusqueda = useCallback(() => {
    setClienteEncontrado(null)
    form.setValue("clienteId", null)
    form.setValue("nombreCompleto", "")
    form.setValue("telefono", "")
    form.setValue("observaciones", "")
  }, [form])

  // ------------------ SUBMIT ------------------
  const onSubmit = form.handleSubmit((data: AsignarClienteInput) => {
    startTransition(async () => {
      const res = await asignarClienteAction(data)

      if (!res.success) {
        toast.error(res.message)
        return
      }

      toast.success(res.message)
      form.reset()
      setClienteEncontrado(null)
      onSuccess?.()
    })
  })

  return {
    form,
    onSubmit,
    isPending,
    buscando,
    clienteEncontrado,
    buscarPorDocumento,
    limpiarBusqueda,
    resetForm,
  }
}
