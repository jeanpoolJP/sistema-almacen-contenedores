// modules\trasegados\hooks\use-finalizar-guia.ts

"use client"

import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"

import {
  cambiarEstadoGuiaAction,
  listarPendientesFinalizarAction,
} from "../actions/finalizar-guia.action"
import type { ElementoPendienteSalida } from "../types/registrar-salida.types"

interface UseFinalizarGuiaOptions {
  guiaId: number
  open: boolean
  finalizar: boolean
  onSuccess?: () => void
}

/**
 * Hook que maneja:
 * - La carga de pendientes al abrir el modal.
 * - El submit para finalizar/reactivar.
 * - El estado de carga.
 */
export function useFinalizarGuia({
  guiaId,
  open,
  finalizar,
  onSuccess,
}: UseFinalizarGuiaOptions) {
  const [isPending, startTransition] = useTransition()

  const [pendientes, setPendientes] = useState<ElementoPendienteSalida[]>([])
  const [cargandoPendientes, setCargandoPendientes] = useState(false)

  // ------------------ CARGA DE PENDIENTES ------------------
  // Solo cargamos pendientes cuando se va a finalizar.
  useEffect(() => {
    if (!open || !finalizar) {
      setPendientes([])
      return
    }

    let cancelado = false

    const cargar = async () => {
      setCargandoPendientes(true)
      const res = await listarPendientesFinalizarAction(guiaId)
      if (cancelado) return
      setCargandoPendientes(false)

      if (!res.success) {
        toast.error(res.message)
        return
      }
      setPendientes(res.pendientes)
    }

    cargar()

    return () => {
      cancelado = true
    }
  }, [open, finalizar, guiaId])

  // ------------------ SUBMIT ------------------
  const confirmar = () => {
    startTransition(async () => {
      const res = await cambiarEstadoGuiaAction({
        guiaTrasegadoId: guiaId,
        finalizar,
        observaciones: "",
      })

      if (!res.success) {
        // Si hay pendientes, actualizamos la lista y mostramos el error
        if (res.pendientes) {
          setPendientes(res.pendientes)
        }
        toast.error(res.message)
        return
      }

      toast.success(res.message)
      onSuccess?.()
    })
  }

  return {
    pendientes,
    cargandoPendientes,
    isPending,
    confirmar,
    /** Puede finalizar si no hay pendientes */
    puedeFinalizar: pendientes.length === 0,
  }
}
