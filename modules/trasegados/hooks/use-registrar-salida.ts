// modules\trasegados\hooks\use-registrar-salida.ts

"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  listarElementosPendientesAction,
  registrarSalidaAction,
} from "../actions/registrar-salida.action"
import {
  registrarSalidaSchema,
  type RegistrarSalidaInput,
} from "../schemas/registrar-salida.schema"
import type { ElementoPendienteSalida } from "../types/registrar-salida.types"

interface UseRegistrarSalidaOptions {
  guiaId: number
  open: boolean
  onSuccess?: () => void
}

/**
 * Hook que encapsula:
 * - Carga de los elementos pendientes de retiro.
 * - Estado del form (fecha/hora + transporte + observaciones + IDs).
 * - Submit contra el server action.
 */
export function useRegistrarSalida({
  guiaId,
  open,
  onSuccess,
}: UseRegistrarSalidaOptions) {
  const [isPending, startTransition] = useTransition()

  // Elementos disponibles (pendientes de retiro)
  const [elementos, setElementos] = useState<ElementoPendienteSalida[]>([])
  const [cargandoElementos, setCargandoElementos] = useState(false)

  // IDs seleccionados (fuera del form porque es UI pura)
  const [elementosSeleccionados, setElementosSeleccionados] = useState<
    Set<number>
  >(new Set())

  const form = useForm<RegistrarSalidaInput>({
    resolver: zodResolver(registrarSalidaSchema),
    defaultValues: {
      guiaTrasegadoId: guiaId,
      fechaSalida: new Date(),
      observaciones: "",
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
      elementosIds: [],
    },
    mode: "onBlur",
  })

  // ------------------ CARGA DE ELEMENTOS ------------------
  const cargarElementos = async () => {
    setCargandoElementos(true)
    const res = await listarElementosPendientesAction(guiaId)
    setCargandoElementos(false)

    if (!res.success) {
      toast.error(res.message)
      return
    }

    setElementos(res.data)
    setElementosSeleccionados(new Set())
    form.setValue("elementosIds", [])
  }

  // Cargar elementos al abrir el modal
  useEffect(() => {
    if (open) {
      cargarElementos()
      form.reset({
        guiaTrasegadoId: guiaId,
        fechaSalida: new Date(),
        observaciones: "",
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
        elementosIds: [],
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, guiaId])

  // ------------------ SELECCIÓN DE ELEMENTOS ------------------
  const toggleElemento = (id: number) => {
    setElementosSeleccionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)

      form.setValue("elementosIds", Array.from(next), {
        shouldValidate: true,
      })
      return next
    })
  }

  const seleccionarTodos = () => {
    const todos = new Set(elementos.map((e) => e.id))
    setElementosSeleccionados(todos)
    form.setValue("elementosIds", Array.from(todos), { shouldValidate: true })
  }

  const limpiarSeleccion = () => {
    setElementosSeleccionados(new Set())
    form.setValue("elementosIds", [], { shouldValidate: true })
  }

  // ------------------ SUBMIT ------------------
  const onSubmit = form.handleSubmit((data: RegistrarSalidaInput) => {
    startTransition(async () => {
      const res = await registrarSalidaAction(data)

      if (!res.success) {
        toast.error(res.message)
        return
      }

      toast.success(res.message)
      form.reset()
      setElementosSeleccionados(new Set())
      onSuccess?.()
    })
  })

  return {
    form,
    onSubmit,
    isPending,
    // elementos
    elementos,
    cargandoElementos,
    elementosSeleccionados,
    toggleElemento,
    seleccionarTodos,
    limpiarSeleccion,
  }
}
