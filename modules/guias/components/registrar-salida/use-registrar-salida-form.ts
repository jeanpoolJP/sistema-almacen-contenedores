// modules/guias/components/registrar-salida/use-registrar-salida-form.ts

"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import {
  registrarSalidaGuiaSchema,
  type RegistrarSalidaGuiaSchema,
} from "../../guia.schema"
import { registrarSalidaGuiaAction } from "../../guia.actions"
import { obtenerConfiguracionPrecioAction } from "@/modules/configuracion/configuracion.actions"

import type { GuiaConRelaciones } from "../guia-con-relaciones.type"
import type { PrecioBase } from "./types"
import { combinarFechaHoraIngreso, combinarFechaHoraSalida } from "./utils"

type UseRegistrarSalidaFormOptions = {
  guia: GuiaConRelaciones
  open: boolean
  onOpenChange: (open: boolean) => void
  onRegistrada?: () => void
}

/**
 * Hook que encapsula toda la lógica del formulario de registro de salida:
 *
 * - Inicialización y reset del formulario
 * - Carga de la configuración de precios estándar al abrir el dialog
 * - Cálculo automático de días según fecha/hora de salida vs ingreso
 * - Manejo del cambio de tipo de precio (sincronización con precios)
 * - Copia de datos del transportista de ingreso
 * - Submit del formulario
 */
export function useRegistrarSalidaForm({
  guia,
  open,
  onOpenChange,
  onRegistrada,
}: UseRegistrarSalidaFormOptions) {
  const [submitting, setSubmitting] = useState(false)
  const [diasEditados, setDiasEditados] = useState(false)
  const [precioBase, setPrecioBase] = useState<PrecioBase | null>(null)

  const form = useForm<RegistrarSalidaGuiaSchema>({
    resolver: zodResolver(registrarSalidaGuiaSchema),

    defaultValues: {
      guiaId: guia.id,

      transportistaSalida: {
        empresaNombre: "",
        ruc: "",
        telefono: "",
        contactoLogistico: "",
        nombreEncargado: "",
        placa: "",
        conductorNombre: "",
        numeroLicencia: "",
      },

      fechaSalida: undefined,
      horaSalida: undefined,

      diasAlmacenamiento: 1,

      tipoPrecio: guia.tipoPrecio,

      precioPrimerDia:
        guia.precioPrimerDia !== null
          ? Number(guia.precioPrimerDia)
          : undefined,

      precioDiaAdicional:
        guia.precioDiaAdicional !== null
          ? Number(guia.precioDiaAdicional)
          : undefined,

      tratamientoIGV: guia.tratamientoIGV,

      cantidadMovimientos:
        guia.cantidadMovimientos !== null
          ? Number(guia.cantidadMovimientos)
          : undefined,

      precioIngresoSalida:
        guia.tipoPrecio === "ESPACIO_ALQUILADO" &&
        guia.precioIngresoSalida !== null
          ? Number(guia.precioIngresoSalida)
          : undefined,
    },
  })

  const tipoPrecio = form.watch("tipoPrecio")
  const fechaSalida = form.watch("fechaSalida")
  const horaSalida = form.watch("horaSalida")

  // Ref para acceder al tipoPrecio actual dentro del efecto de carga
  // sin incluirlo como dependencia (evita recargas innecesarias).
  const tipoPrecioRef = useRef(tipoPrecio)
  tipoPrecioRef.current = tipoPrecio

  // ============================================================
  // CARGA DE CONFIGURACIÓN DE PRECIOS
  // Solo se ejecuta al abrir el dialog, no cuando cambia tipoPrecio.
  // ============================================================
  useEffect(() => {
    if (!open) return

    async function cargarConfiguracion() {
      try {
        const res = await obtenerConfiguracionPrecioAction()

        if (!res.success || !res.data) {
          toast.error(
            res.success
              ? "No se recibió la configuración de precios"
              : res.message
          )
          return
        }

        const config: PrecioBase = {
          precioPrimerDia: Number(res.data.precioPrimerDia),
          precioDiaAdicional: Number(res.data.precioDiaAdicional),
          porcentajeIGV: Number(res.data.porcentajeIGV),
        }

        setPrecioBase(config)

        // Sincronizar los precios del formulario solo si el tipo actual es ESTANDAR.
        // Usamos la ref para no reejecutar el efecto cuando cambia tipoPrecio.
        if (tipoPrecioRef.current === "ESTANDAR") {
          form.setValue(
            "precioPrimerDia",
            guia.contenedor.tipo === "REEFER" ? 40 : config.precioPrimerDia,
            { shouldValidate: true }
          )

          form.setValue("precioDiaAdicional", config.precioDiaAdicional, {
            shouldValidate: true,
          })
        }
      } catch {
        toast.error("No se pudo cargar la configuración de precios")
      }
    }

    cargarConfiguracion()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // ============================================================
  // CÁLCULO AUTOMÁTICO DE DÍAS
  // Se recalcula cuando cambia la fecha/hora de salida,
  // pero solo si el usuario no editó los días manualmente.
  // ============================================================
  useEffect(() => {
    if (!fechaSalida || !horaSalida || diasEditados) {
      return
    }

    const fechaHoraSalida = combinarFechaHoraSalida(fechaSalida, horaSalida)
    const fechaHoraIngreso = combinarFechaHoraIngreso(
      guia.fechaIngreso,
      guia.horaIngreso
    )

    const diferenciaMs = fechaHoraSalida.getTime() - fechaHoraIngreso.getTime()
    const horas = diferenciaMs / (1000 * 60 * 60)
    const diasCalculados = Math.max(1, Math.ceil(horas / 24))

    form.setValue("diasAlmacenamiento", diasCalculados, {
      shouldValidate: true,
      shouldDirty: false,
    })
  }, [
    fechaSalida,
    horaSalida,
    diasEditados,
    guia.fechaIngreso,
    guia.horaIngreso,
    form,
  ])

  // ============================================================
  // COPIAR DATOS DEL TRANSPORTISTA DE INGRESO
  // ============================================================
  const copiarDatosIngreso = useCallback(() => {
    form.setValue(
      "transportistaSalida.empresaNombre",
      guia.empresaTransporteIngreso.nombre
    )
    form.setValue(
      "transportistaSalida.ruc",
      guia.empresaTransporteIngreso.ruc ?? ""
    )
    form.setValue(
      "transportistaSalida.telefono",
      guia.empresaTransporteIngreso.telefono ?? ""
    )
    form.setValue(
      "transportistaSalida.contactoLogistico",
      guia.empresaTransporteIngreso.contactoLogistico ?? ""
    )
    form.setValue(
      "transportistaSalida.nombreEncargado",
      guia.empresaTransporteIngreso.nombreEncargado ?? ""
    )
    form.setValue("transportistaSalida.placa", guia.vehiculoIngreso.placa)
    form.setValue(
      "transportistaSalida.conductorNombre",
      guia.conductorIngreso.nombreCompleto
    )
    form.setValue(
      "transportistaSalida.numeroLicencia",
      guia.conductorIngreso.numeroLicencia
    )

    toast.info("Se copiaron los datos del transportista de ingreso")
  }, [form, guia])

  // ============================================================
  // CAMBIO DE TIPO DE PRECIO
  // Sincroniza los precios del formulario según el tipo seleccionado.
  // ============================================================
  const handleTipoPrecioChange = useCallback(
    (value: "ESTANDAR" | "PERSONALIZADO" | "ESPACIO_ALQUILADO" | null) => {
      if (!value) return

      form.setValue("tipoPrecio", value)

      if (value !== "ESPACIO_ALQUILADO") {
        form.setValue("precioIngresoSalida", undefined, {
          shouldValidate: true,
        })
      }

      if (value === "ESTANDAR") {
        if (!precioBase) {
          toast.error("No se pudo cargar la configuración de precios")
          return
        }

        form.setValue(
          "precioPrimerDia",
          guia.contenedor.tipo === "REEFER" ? 40 : precioBase.precioPrimerDia,
          { shouldValidate: true }
        )

        form.setValue("precioDiaAdicional", precioBase.precioDiaAdicional, {
          shouldValidate: true,
        })

        return
      }

      if (value === "PERSONALIZADO") {
        form.setValue(
          "precioPrimerDia",
          guia.precioPrimerDia !== null
            ? Number(guia.precioPrimerDia)
            : undefined
        )

        form.setValue(
          "precioDiaAdicional",
          guia.precioDiaAdicional !== null
            ? Number(guia.precioDiaAdicional)
            : undefined
        )

        return
      }
    },
    [form, precioBase, guia]
  )

  // ============================================================
  // SUBMIT
  // ============================================================
  const onSubmit = useCallback(
    async (data: RegistrarSalidaGuiaSchema) => {
      setSubmitting(true)

      const res = await registrarSalidaGuiaAction(data)

      setSubmitting(false)

      if (!res.success) {
        toast.error(res.message)
        return
      }

      toast.success(res.message)

      form.reset()
      setDiasEditados(false)
      onOpenChange(false)
      onRegistrada?.()
    },
    [form, onOpenChange, onRegistrada]
  )

  return {
    form,
    submitting,
    diasEditados,
    setDiasEditados,
    precioBase,
    tipoPrecio,
    copiarDatosIngreso,
    handleTipoPrecioChange,
    onSubmit,
  }
}
