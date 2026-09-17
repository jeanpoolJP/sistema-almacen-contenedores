// modules\trasegados\hooks\use-crear-guia-trasegado.ts

// modules/trasegados/hooks/use-crear-guia-trasegado.ts
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { crearGuiaTrasegadoAction } from "../actions/crear-guia-trasegado.action"
import {
  crearGuiaTrasegadoSchema,
  type CrearGuiaTrasegadoInput,
} from "../schemas/crear-guia-trasegado.schema"

/**
 * Hook que encapsula el ciclo de vida del formulario de creación
 * de guías de trasegado.
 *
 * IMPORTANTE:
 * El array de elementos empieza vacío para que sea el usuario
 * quien elija el primer tipo de elemento a registrar.
 */
export function useCrearGuiaTrasegado() {
  const [isPending, startTransition] = useTransition()
  const [serverErrors, setServerErrors] = useState<Record<
    string,
    string[]
  > | null>(null)

  const form = useForm<CrearGuiaTrasegadoInput>({
    resolver: zodResolver(crearGuiaTrasegadoSchema),
    defaultValues: {
      numeroGuia: "",
      descripcionServicio: "",
      clienteId: null,
      fechaIngreso: new Date(),
      observaciones: "",
      ingreso: {
        empresaTransporte: {
          ruc: "",
          nombre: "",
          telefono: "",
          contactoLogistico: "",
          nombreEncargado: "",
        },
        vehiculo: {
          placa: "",
          tipo: null,
          descripcion: "",
        },
        conductor: {
          numeroLicencia: "",
          nombreCompleto: "",
          telefono: "",
        },
        // Sin elementos: el usuario elige el primero.
        elementos: [],
      },
    },
    mode: "onBlur",
  })

  const onSubmit = form.handleSubmit((data) => {
    setServerErrors(null)

    startTransition(async () => {
      const result = await crearGuiaTrasegadoAction(data)

      if (!result.success) {
        if (result.errors) setServerErrors(result.errors)
        toast.error(result.message ?? "No se pudo crear la guía.")
        return
      }

      toast.success("Guía de trasegado creada correctamente.")
      form.reset()
    })
  })

  return {
    form,
    onSubmit,
    isPending,
    serverErrors,
  }
}
