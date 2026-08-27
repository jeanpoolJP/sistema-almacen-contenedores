// modules/guias/components/registrar-salida-dialog.tsx

"use client"

import { useEffect, useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CopyPlus, LogOut } from "lucide-react"
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

  const form = useForm<RegistrarSalidaGuiaSchema>({
    resolver: zodResolver(registrarSalidaGuiaSchema),

    defaultValues: {
      guiaId: guia.id,

      transportistaSalida: {
        empresaNombre: "",
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

  // Observamos fecha y hora de salida
  const fechaSalida = form.watch("fechaSalida")
  const horaSalida = form.watch("horaSalida")

  /**
   * Calcula automáticamente los días de almacenamiento
   * cuando cambia la fecha/hora de salida.
   */
  useEffect(() => {
    if (!fechaSalida || !horaSalida || diasEditados) {
      return
    }

    const fechaHoraSalida = new Date(fechaSalida)

    fechaHoraSalida.setHours(
      horaSalida.getHours(),
      horaSalida.getMinutes(),
      0,
      0
    )

    const fechaHoraIngreso = new Date(guia.fechaIngreso)

    fechaHoraIngreso.setHours(
      guia.horaIngreso.getHours(),
      guia.horaIngreso.getMinutes(),
      0,
      0
    )

    const diferenciaMs = fechaHoraSalida.getTime() - fechaHoraIngreso.getTime()

    const diferenciaDias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24))

    const diasCalculados = Math.max(1, diferenciaDias)

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

              <FechaHoraField
                fechaName="fechaSalida"
                horaName="horaSalida"
                label="Fecha y hora de salida"
              />

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
                        onValueChange={field.onChange}
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
