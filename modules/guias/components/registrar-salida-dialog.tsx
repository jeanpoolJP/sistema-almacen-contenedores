// modules/guias/components/registrar-salida-dialog.tsx

"use client"

import { useEffect, useState, useMemo } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Clock, CopyPlus, LogOut } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  registrarSalidaGuiaSchema,
  type RegistrarSalidaGuiaSchema,
} from "../guia.schema"
import { registrarSalidaGuiaAction } from "../guia.actions"
import { TransportistaFields } from "./fields/transportista-fields"
import { FechaHoraField } from "./fields/fecha-hora-field"
import type { GuiaConRelaciones } from "./guia-con-relaciones.type"
import { calcularMontoGuia } from "../utils/calcular-monto"
import {
  calcularMontoEspacioAlquilado,
  calcularPrecioMovimientos,
} from "../utils/calcular-monto-espacio-alquilado"

import { obtenerConfiguracionPrecioAction } from "@/modules/configuracion/configuracion.actions"

function formatearFechaIngreso(fecha: Date | string) {
  const fechaDate = typeof fecha === "string" ? new Date(fecha) : fecha

  const dia = String(fechaDate.getUTCDate()).padStart(2, "0")

  const meses = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ]

  const mes = meses[fechaDate.getUTCMonth()]
  const año = fechaDate.getUTCFullYear()

  return `${dia} ${mes} ${año}`
}

function formatearHoraIngreso(hora: Date | string) {
  const horaDate = typeof hora === "string" ? new Date(hora) : hora

  const horas = String(horaDate.getUTCHours()).padStart(2, "0")
  const minutos = String(horaDate.getUTCMinutes()).padStart(2, "0")

  return `${horas}:${minutos}`
}

function combinarFechaHoraIngreso(fecha: Date, hora: Date) {
  return new Date(
    Date.UTC(
      fecha.getUTCFullYear(),
      fecha.getUTCMonth(),
      fecha.getUTCDate(),
      hora.getUTCHours(),
      hora.getUTCMinutes(),
      hora.getUTCSeconds(),
      0
    )
  )
}

function combinarFechaHoraSalida(fecha: Date, hora: Date) {
  return new Date(
    Date.UTC(
      fecha.getFullYear(),
      fecha.getMonth(),
      fecha.getDate(),
      hora.getUTCHours(),
      hora.getUTCMinutes(),
      hora.getUTCSeconds(),
      0
    )
  )
}

function formatearMonto(valor: number) {
  return `S/ ${valor.toFixed(2)}`
}

function valorParaInput(valor: number | undefined) {
  return valor === undefined || Number.isNaN(valor) ? "" : valor
}

type RegistrarSalidaDialogProps = {
  guia: GuiaConRelaciones
  open: boolean
  onOpenChange: (open: boolean) => void
  onRegistrada?: () => void
}

export function RegistrarSalidaDialog({
  guia,
  open,
  onOpenChange,
  onRegistrada,
}: RegistrarSalidaDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const [diasEditados, setDiasEditados] = useState(false)

  const [precioBase, setPrecioBase] = useState<{
    precioPrimerDia: number
    precioDiaAdicional: number
    porcentajeIGV: number
  } | null>(null)

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
        guia.precioIngresoSalida !== null
          ? Number(guia.precioIngresoSalida)
          : 50,
    },
  })

  const tratamientoIGV = form.watch("tratamientoIGV")
  const tipoPrecio = form.watch("tipoPrecio")
  const fechaSalida = form.watch("fechaSalida")
  const horaSalida = form.watch("horaSalida")
  const diasAlmacenamiento = form.watch("diasAlmacenamiento")
  const precioPrimerDia = form.watch("precioPrimerDia")
  const precioDiaAdicional = form.watch("precioDiaAdicional")
  const cantidadMovimientos = form.watch("cantidadMovimientos")
  const precioIngresoSalida = form.watch("precioIngresoSalida")

  const precioPrimerDiaEstandar =
    guia.contenedor.tipo === "REEFER" ? 40 : precioBase?.precioPrimerDia

  // Calcular días automáticamente
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

  // Cargar configuración de precios
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

        setPrecioBase({
          precioPrimerDia: Number(res.data.precioPrimerDia),
          precioDiaAdicional: Number(res.data.precioDiaAdicional),
          porcentajeIGV: Number(res.data.porcentajeIGV),
        })

        // Si el tipo es ESTANDAR, sincronizar con la configuración
        if (tipoPrecio === "ESTANDAR") {
          form.setValue(
            "precioPrimerDia",
            guia.contenedor.tipo === "REEFER"
              ? 40
              : Number(res.data.precioPrimerDia),
            {
              shouldValidate: true,
            }
          )

          form.setValue(
            "precioDiaAdicional",
            Number(res.data.precioDiaAdicional),
            {
              shouldValidate: true,
            }
          )
        }
      } catch {
        toast.error("No se pudo cargar la configuración de precios")
      }
    }

    cargarConfiguracion()
  }, [open, tipoPrecio, form])

  function copiarDatosIngreso() {
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
  }

  async function onSubmit(data: RegistrarSalidaGuiaSchema) {
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
  }

  function handleTipoPrecioChange(
    value: "ESTANDAR" | "PERSONALIZADO" | "ESPACIO_ALQUILADO" | null
  ) {
    if (!value) return

    form.setValue("tipoPrecio", value)

    if (value === "ESTANDAR") {
      if (!precioBase) {
        toast.error("No se pudo cargar la configuración de precios")
        return
      }

      form.setValue(
        "precioPrimerDia",
        guia.contenedor.tipo === "REEFER" ? 40 : precioBase.precioPrimerDia,
        {
          shouldValidate: true,
        }
      )

      form.setValue("precioDiaAdicional", precioBase.precioDiaAdicional, {
        shouldValidate: true,
      })

      return
    }

    if (value === "PERSONALIZADO") {
      form.setValue(
        "precioPrimerDia",
        guia.precioPrimerDia !== null ? Number(guia.precioPrimerDia) : undefined
      )

      form.setValue(
        "precioDiaAdicional",
        guia.precioDiaAdicional !== null
          ? Number(guia.precioDiaAdicional)
          : undefined
      )

      return
    }

    if (value === "ESPACIO_ALQUILADO") {
      form.setValue("precioPrimerDia", undefined)
      form.setValue("precioDiaAdicional", undefined)
    }
  }

  const calculo = useMemo(() => {
    try {
      if (!tipoPrecio) return null

      // Determinar porcentaje IGV
      const porcentajeIGV =
        guia.porcentajeIGV !== null
          ? Number(guia.porcentajeIGV)
          : precioBase?.porcentajeIGV

      if (porcentajeIGV === undefined) {
        return null
      }

      if (tipoPrecio === "ESTANDAR") {
        if (
          !precioBase ||
          !diasAlmacenamiento ||
          diasAlmacenamiento < 1 ||
          precioBase.precioPrimerDia === undefined ||
          precioBase.precioDiaAdicional === undefined
        ) {
          return null
        }

        if (
          !precioBase ||
          !diasAlmacenamiento ||
          diasAlmacenamiento < 1 ||
          precioPrimerDiaEstandar === undefined ||
          precioBase.precioDiaAdicional === undefined
        ) {
          return null
        }

        return calcularMontoGuia({
          diasAlmacenamiento: Number(diasAlmacenamiento),
          precioPrimerDia: precioPrimerDiaEstandar,
          precioDiaAdicional: precioBase.precioDiaAdicional,
          tratamientoIGV,
          porcentajeIGV,
        })
      }

      if (tipoPrecio === "PERSONALIZADO") {
        if (
          !diasAlmacenamiento ||
          diasAlmacenamiento < 1 ||
          precioPrimerDia === undefined ||
          precioPrimerDia <= 0 ||
          precioDiaAdicional === undefined ||
          precioDiaAdicional < 0
        ) {
          return null
        }

        return calcularMontoGuia({
          diasAlmacenamiento: Number(diasAlmacenamiento),
          precioPrimerDia: Number(precioPrimerDia),
          precioDiaAdicional: Number(precioDiaAdicional),
          tratamientoIGV,
          porcentajeIGV,
        })
      }

      if (tipoPrecio === "ESPACIO_ALQUILADO") {
        if (
          precioIngresoSalida === undefined ||
          precioIngresoSalida < 0 ||
          cantidadMovimientos === undefined ||
          cantidadMovimientos < 0
        ) {
          return null
        }

        return calcularMontoEspacioAlquilado({
          precioIngresoSalida: Number(precioIngresoSalida),
          cantidadMovimientos: Number(cantidadMovimientos),
          tratamientoIGV,
          porcentajeIGV,
        })
      }

      return null
    } catch {
      return null
    }
  }, [
    tipoPrecio,
    diasAlmacenamiento,
    precioPrimerDia,
    precioDiaAdicional,
    precioIngresoSalida,
    cantidadMovimientos,
    tratamientoIGV,
    precioBase,
    precioPrimerDiaEstandar,
    guia.porcentajeIGV,
  ])

  const getCalculoTitle = () => {
    if (tipoPrecio === "ESTANDAR") return "Cálculo de almacenamiento"
    if (tipoPrecio === "PERSONALIZADO") return "Cálculo personalizado"
    if (tipoPrecio === "ESPACIO_ALQUILADO")
      return "Cálculo de espacio alquilado"
    return "Cálculo"
  }

  const renderCalculoPreview = () => {
    if (!calculo) {
      return (
        <div className="rounded-lg border bg-muted/50 p-4 text-center text-sm text-muted-foreground">
          Completa los datos para calcular el monto
        </div>
      )
    }

    const diasAdicionales = Math.max(0, Number(diasAlmacenamiento || 0) - 1)

    if (tipoPrecio === "ESTANDAR" || tipoPrecio === "PERSONALIZADO") {
      return (
        <div className="rounded-lg border bg-primary/5 p-4">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Primer día</span>
              <span className="font-medium">
                {formatearMonto(
                  tipoPrecio === "ESTANDAR"
                    ? precioPrimerDiaEstandar || 0
                    : Number(precioPrimerDia) || 0
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Días adicionales</span>
              <span className="font-medium">{diasAdicionales}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Precio día adicional
              </span>
              <span className="font-medium">
                {formatearMonto(
                  tipoPrecio === "ESTANDAR"
                    ? precioBase?.precioDiaAdicional || 0
                    : Number(precioDiaAdicional) || 0
                )}
              </span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">
                {formatearMonto(calculo.subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IGV</span>
              <span className="font-medium">
                {formatearMonto(calculo.montoIGV)}
              </span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-base font-bold">
              <span>Monto total</span>
              <span className="text-primary">
                {formatearMonto(calculo.montoTotal)}
              </span>
            </div>
          </div>
        </div>
      )
    }

    if (tipoPrecio === "ESPACIO_ALQUILADO") {
      const cantidadMovimientosNumero = Number(cantidadMovimientos || 0)

      const subtotalMovimientos = calcularPrecioMovimientos(
        cantidadMovimientosNumero
      )

      return (
        <div className="rounded-lg border bg-primary/5 p-4">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Precio ingreso / salida
              </span>

              <span className="font-medium">
                {formatearMonto(Number(precioIngresoSalida) || 0)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Movimientos</span>

              <span className="font-medium">{cantidadMovimientosNumero}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Tarifa por movimientos
              </span>

              <span className="font-medium">
                {formatearMonto(subtotalMovimientos)}
              </span>
            </div>

            <Separator className="my-2" />

            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>

              <span className="font-medium">
                {formatearMonto(calculo.subtotal)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">IGV</span>

              <span className="font-medium">
                {formatearMonto(calculo.montoIGV)}
              </span>
            </div>

            <Separator className="my-2" />

            <div className="flex justify-between text-base font-bold">
              <span>Monto total</span>

              <span className="text-primary">
                {formatearMonto(calculo.montoTotal)}
              </span>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1rem)] max-w-4xl overflow-hidden p-0 sm:w-[calc(100%-2rem)] lg:max-w-5xl">
        <DialogHeader className="border-b px-4 py-4 sm:px-6">
          <DialogTitle>Registrar salida — Guía {guia.numeroGuia}</DialogTitle>

          <DialogDescription>
            Contenedor {guia.contenedor.numeroContenedor} ·{" "}
            {guia.cliente?.nombreCompleto ??
              guia.cliente?.numeroDocumento ??
              "Sin cliente"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] px-4 sm:px-6">
          <FormProvider {...form}>
            <form
              id="registrar-salida-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 py-4"
            >
              {/* ============================================================
                TRANSPORTISTA
              ============================================================ */}

              <div className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold">
                    Transportista que recoge
                  </p>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-fit gap-1.5 text-xs text-muted-foreground"
                    onClick={copiarDatosIngreso}
                  >
                    <CopyPlus className="size-3.5" />
                    Usar mismos datos de ingreso
                  </Button>
                </div>

                <TransportistaFields prefix="transportistaSalida" />
              </div>

              <Separator />

              {/* ============================================================
                FECHA Y HORA DE SALIDA
              ============================================================ */}

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold">Fecha y hora</h3>

                  <p className="text-xs text-muted-foreground">
                    Consulta la fecha de ingreso y registra la fecha y hora de
                    salida.
                  </p>
                </div>

                {/* FECHA Y HORA DE INGRESO */}
                <div className="space-y-2">
                  <span className="text-sm font-medium">
                    Fecha y hora de ingreso
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    {/* FECHA INGRESO */}
                    <div className="flex h-10 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                      <CalendarIcon className="mr-2 size-4 shrink-0" />

                      {formatearFechaIngreso(guia.fechaIngreso)}
                    </div>

                    {/* HORA INGRESO */}
                    <div className="flex h-10 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                      <Clock className="mr-2 size-4 shrink-0" />

                      {formatearHoraIngreso(guia.horaIngreso)}
                    </div>
                  </div>
                </div>

                {/* FECHA Y HORA DE SALIDA */}
                <FechaHoraField
                  fechaName="fechaSalida"
                  horaName="horaSalida"
                  label="Fecha y hora de salida"
                />
              </div>

              <Separator />

              {/* ============================================================
                ALMACENAMIENTO Y PRECIOS
              ============================================================ */}

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold">
                    Cálculo de almacenamiento
                  </h3>

                  <p className="text-xs text-muted-foreground">
                    Los días se calculan automáticamente. Puedes modificar los
                    días y, si corresponde, los precios.
                  </p>
                </div>

                {/* DÍAS */}
                <FormField
                  control={form.control}
                  name="diasAlmacenamiento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Días de almacenamiento</FormLabel>

                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={valorParaInput(field.value)}
                          onChange={(e) => {
                            const value = e.target.value

                            field.onChange(
                              value === "" ? undefined : Number(value)
                            )

                            setDiasEditados(true)
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* TIPO DE PRECIO */}
                <FormField
                  control={form.control}
                  name="tipoPrecio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de precio</FormLabel>

                      <Select
                        onValueChange={handleTipoPrecioChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          <SelectItem value="ESTANDAR">Estándar</SelectItem>

                          <SelectItem value="PERSONALIZADO">
                            Personalizado
                          </SelectItem>

                          <SelectItem value="ESPACIO_ALQUILADO">
                            Espacio alquilado
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* PRECIOS */}
                {(tipoPrecio === "ESTANDAR" ||
                  tipoPrecio === "PERSONALIZADO") && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* PRECIO PRIMER DÍA */}
                    <FormField
                      control={form.control}
                      name="precioPrimerDia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio primer día (S/)</FormLabel>

                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              disabled={tipoPrecio === "ESTANDAR"}
                              className={
                                tipoPrecio === "ESTANDAR"
                                  ? "bg-muted"
                                  : undefined
                              }
                              value={valorParaInput(field.value)}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? undefined
                                    : Number(e.target.value)
                                )
                              }
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* PRECIO DÍA ADICIONAL */}
                    <FormField
                      control={form.control}
                      name="precioDiaAdicional"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio día adicional (S/)</FormLabel>

                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              disabled={tipoPrecio === "ESTANDAR"}
                              className={
                                tipoPrecio === "ESTANDAR"
                                  ? "bg-muted"
                                  : undefined
                              }
                              value={valorParaInput(field.value)}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? undefined
                                    : Number(e.target.value)
                                )
                              }
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* ============================================================
                ESPACIO ALQUILADO - CAMPOS ADICIONALES
              ============================================================ */}

              {tipoPrecio === "ESPACIO_ALQUILADO" && (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="precioIngresoSalida"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio ingreso / salida (S/)</FormLabel>

                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={valorParaInput(field.value)}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? undefined
                                    : Number(e.target.value)
                                )
                              }
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </FormControl>

                          <FormMessage />

                          <p className="text-xs text-muted-foreground">
                            Precio base por ingreso y salida. Puedes modificarlo
                            para esta guía.
                          </p>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cantidadMovimientos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cantidad de movimientos</FormLabel>

                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              value={valorParaInput(field.value)}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? undefined
                                    : Number(e.target.value)
                                )
                              }
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Separator />
                </>
              )}

              {/* ============================================================
                IGV
              ============================================================ */}

              <div className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-0.5">
                  <Label>¿El cliente solicita factura (con IGV)?</Label>

                  <p className="text-xs text-muted-foreground">
                    Se recalculará el monto total con el IGV correspondiente.
                  </p>
                </div>

                <Switch
                  checked={tratamientoIGV === "CON_IGV"}
                  onCheckedChange={(checked) =>
                    form.setValue(
                      "tratamientoIGV",
                      checked ? "CON_IGV" : "SIN_IGV"
                    )
                  }
                />
              </div>

              {/* ============================================================
                PREVISUALIZACIÓN DEL CÁLCULO
              ============================================================ */}

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">{getCalculoTitle()}</h4>
                {renderCalculoPreview()}
              </div>
            </form>
          </FormProvider>
        </ScrollArea>

        {/* ================================================================
          FOOTER
        ================================================================ */}

        <DialogFooter className="border-t px-4 py-4 sm:px-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            form="registrar-salida-form"
            disabled={submitting}
            className="w-full gap-2 sm:w-auto"
          >
            <LogOut className="size-4" />

            {submitting ? "Guardando..." : "Registrar salida"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
