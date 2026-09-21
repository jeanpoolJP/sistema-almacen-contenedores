// modules\trasegados\hooks\use-registrar-pago.ts

"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState, useTransition } from "react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import {
  obtenerEstadoPagoAction,
  registrarPagoAction,
} from "../actions/registrar-pago.action"
import {
  registrarPagoSchema,
  type RegistrarPagoInput,
} from "../schemas/registrar-pago.schema"
import { calcularTotales } from "../utils/calcular-totales"

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

  const form = useForm<RegistrarPagoInput>({
    resolver: zodResolver<RegistrarPagoInput, any, RegistrarPagoInput>(
      registrarPagoSchema
    ),
    defaultValues: {
      guiaTrasegadoId: guiaId,
      montoBase: 0,
      tratamientoIGV: "SIN_IGV",
      porcentajeIGV: 18,
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

      form.reset({
        guiaTrasegadoId: guiaId,
        montoBase: p.subtotal ?? p.totalPagar ?? 0,
        tratamientoIGV: p.tratamientoIGV,
        porcentajeIGV: p.porcentajeIGV ?? 18,
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

  // ------------------ TOTALES REACTIVOS ------------------
  // useWatch para que la UI muestre el cálculo en vivo
  const montoBase = useWatch({ control: form.control, name: "montoBase" })
  const tratamientoIGV = useWatch({
    control: form.control,
    name: "tratamientoIGV",
  })
  const porcentajeIGV = useWatch({
    control: form.control,
    name: "porcentajeIGV",
  })
  const metodoPago = useWatch({ control: form.control, name: "metodoPago" })

  const totales = calcularTotales({
    montoBase: Number(montoBase) || 0,
    tratamientoIGV,
    porcentajeIGV: Number(porcentajeIGV) || 0,
  })

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
    totales,
    metodoPago,
  }
}
