// modules/guias/components/registrar-salida-dialog.tsx

"use client"

import { useEffect, useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Clock, CopyPlus, LogOut } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"

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
  } | null>(null)

  const precioPersonalizadoGuia = {
    precioPrimerDia: Number(guia.precioPrimerDia),
    precioDiaAdicional: Number(guia.precioDiaAdicional),
  }

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

      precioPrimerDia: Number(guia.precioPrimerDia),

      precioDiaAdicional: Number(guia.precioDiaAdicional),

      tratamientoIGV: guia.tratamientoIGV,
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const tratamientoIGV = form.watch("tratamientoIGV")
  const tipoPrecio = form.watch("tipoPrecio")
  const fechaSalida = form.watch("fechaSalida")
  const horaSalida = form.watch("horaSalida")

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

  function handleTipoPrecioChange(value: "ESTANDAR" | "PERSONALIZADO" | null) {
    if (!value) return

    form.setValue("tipoPrecio", value)

    if (value === "ESTANDAR" && precioBase) {
      form.setValue("precioPrimerDia", precioBase.precioPrimerDia)
      form.setValue("precioDiaAdicional", precioBase.precioDiaAdicional)

      return
    }

    if (value === "PERSONALIZADO") {
      form.setValue("precioPrimerDia", Number(guia.precioPrimerDia))

      form.setValue("precioDiaAdicional", Number(guia.precioDiaAdicional))
    }
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
                          value={field.value ?? ""}
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
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* PRECIOS */}
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
                              tipoPrecio === "ESTANDAR" ? "bg-muted" : undefined
                            }
                            value={field.value ?? ""}
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
                              tipoPrecio === "ESTANDAR" ? "bg-muted" : undefined
                            }
                            value={field.value ?? ""}
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
              </div>

              <Separator />

              {/* ============================================================
                IGV
            ============================================================ */}

              <div className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-0.5">
                  <Label>¿El cliente solicita factura (con IGV)?</Label>

                  <p className="text-xs text-muted-foreground">
                    Se recalculará el monto total con el 18% de IGV.
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
