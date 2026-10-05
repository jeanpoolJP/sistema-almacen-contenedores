// modules\trasegados\hooks\use-registrar-pago.ts

"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  obtenerEstadoPagoAction,
  registrarPagoAction,
} from "../actions/registrar-pago.action"
import {
  registrarPagoSchema,
  type RegistrarPagoInput,
} from "../schemas/registrar-pago.schema"

interface UseRegistrarPagoOptions {
  guiaId: number
  open: boolean
  onSuccess?: () => void
}

export function useRegistrarPago({
  guiaId,
  open,
  onSuccess,
}: UseRegistrarPagoOptions) {
  const [isPending, startTransition] = useTransition()
  const [cargandoEstado, setCargandoEstado] = useState(false)
  const [esEdicion, setEsEdicion] = useState(false)
  const [cotizacion, setCotizacion] = useState<{
    numeroCotizacion: string
    montoPagar: number
  } | null>(null)

  const form = useForm<RegistrarPagoInput>({
    resolver: zodResolver(registrarPagoSchema),
    defaultValues: {
      guiaTrasegadoId: guiaId,
      metodoPago: "EFECTIVO",
      numeroOperacion: "",
      fechaPago: new Date(),
      observaciones: "",
    },
    mode: "onBlur",
  })

  // ------------------ CARGAR ESTADO AL ABRIR ------------------
  useEffect(() => {
    if (!open) return

    let cancelado = false

    const cargar = async () => {
      setCargandoEstado(true)
      setCotizacion(null)
      const res = await obtenerEstadoPagoAction(guiaId)
      if (cancelado) return
      setCargandoEstado(false)

      if (!res.success) {
        toast.error(res.message)
        return
      }

      const p = res.data
      const pagado = p.estadoPago === "PAGADO"
      setEsEdicion(pagado)

      if (!p.numeroCotizacion || p.totalPagar == null) {
        setCotizacion(null)
        toast.error("Asigna una cotización antes de registrar el pago.")
        return
      }

      setCotizacion({
        numeroCotizacion: p.numeroCotizacion,
        montoPagar: p.totalPagar,
      })

      form.reset({
        guiaTrasegadoId: guiaId,
        metodoPago:
          (p.metodoPago as RegistrarPagoInput["metodoPago"]) ?? "EFECTIVO",
        numeroOperacion: p.numeroOperacion ?? "",
        fechaPago: p.fechaPago ?? new Date(),
        observaciones: "",
      })
    }

    cargar()

    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, guiaId])

  // ------------------ SUBMIT ------------------
  const onSubmit = form.handleSubmit((data: RegistrarPagoInput) => {
    startTransition(async () => {
      const res = await registrarPagoAction(data)

      if (!res.success) {
        toast.error(res.message)
        return
      }

      toast.success(res.message)
      onSuccess?.()
    })
  })

  return {
    form,
    onSubmit,
    isPending,
    cargandoEstado,
    esEdicion,
    cotizacion,
  }
}
