// modules/control-alquiler/components/guia-alquiler-form-sheet.tsx
"use client"

import { useEffect, useMemo, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  guiaAlquilerSchema,
  type GuiaAlquilerFormData,
} from "../control-alquiler.schema"
import {
  actualizarGuiaAlquilerAction,
  registrarGuiaAlquilerAction,
} from "../control-alquiler.actions"
import {
  calcularHorasServicio,
  calcularImporteAlquiler,
  calcularHorasUsoMaquina,
  calcularCotizacion,
  formatMoneda,
  formatNumero,
} from "../utils/control-alquiler.utils"

import type { GuiaAlquilerListItem } from "../control-alquiler.types"
import type { Equipo } from "@/modules/equipos/equipos.types"
import type { Operador } from "@/modules/operadores/operadores.types"
import type { Cliente } from "@/modules/clientes/cliente.types"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  guia: GuiaAlquilerListItem | null
  equipos: Equipo[]
  operadores: Operador[]
  clientes: Cliente[]
}

function decimalDesdeCampo(valor: unknown): number | null {
  if (typeof valor === "number") {
    return Number.isFinite(valor) ? valor : null
  }

  if (typeof valor !== "string" || valor.trim() === "") return null

  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : null
}

export function GuiaAlquilerFormSheet({
  open,
  onOpenChange,
  guia,
  equipos,
  operadores,
  clientes,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const esEdicion = !!guia

  const defaultValues: GuiaAlquilerFormData = {
    numeroGuia: "",
    fechaInicio: new Date(),
    fechaFin: new Date(),
    descripcionServicio: null,
    solicitante: null,
    lugarServicio: null,
    horaSalida: null,
    horaInicio: null,
    horaFinalizacion: null,
    horaRetorno: null,
    horasMinimas: null,
    precioPorHora: null,
    numeroCotizacion: null,
    modoIGVCotizacion: "SIN_IGV",
    horometroInicial: null,
    horometroFinal: null,
    observaciones: null,
    estado: "EN_PROCESO",
    clienteId: null,
    equipoId: "",
    operadorId: null,
    nombreOperadorExterno: null,
  }

  const form = useForm<GuiaAlquilerFormData>({
    resolver: zodResolver(guiaAlquilerSchema as any),
    defaultValues: defaultValues as GuiaAlquilerFormData,
  })

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = form

  useEffect(() => {
    if (open) {
      if (guia) {
        reset({
          ...defaultValues,
          numeroGuia: guia.numeroGuia,
          fechaInicio: guia.fechaInicio
            ? new Date(guia.fechaInicio)
            : new Date(),
          fechaFin: guia.fechaFin ? new Date(guia.fechaFin) : new Date(),
          descripcionServicio: guia.descripcionServicio ?? null,
          solicitante: guia.solicitante ?? null,
          lugarServicio: guia.lugarServicio ?? null,
          horaSalida: guia.horaSalida ?? null,
          horaInicio: guia.horaInicio ?? null,
          horaFinalizacion: guia.horaFinalizacion ?? null,
          horaRetorno: guia.horaRetorno ?? null,
          horasMinimas: guia.horasMinimas ?? null,
          precioPorHora: guia.precioPorHora ?? null,
          numeroCotizacion: guia.numeroCotizacion ?? null,
          modoIGVCotizacion: guia.modoIGVCotizacion ?? "SIN_IGV",
          horometroInicial: guia.horometroInicial ?? null,
          horometroFinal: guia.horometroFinal ?? null,
          observaciones: guia.observaciones ?? null,
          estado: guia.estado,
          clienteId: guia.cliente?.id ?? null,
          equipoId: guia.equipo.id,
          operadorId: guia.operador?.id ?? null,
          nombreOperadorExterno: guia.nombreOperadorExterno ?? null,
        })
      } else {
        reset(defaultValues)
      }
    }
  }, [open, guia, reset])

  // Valores observados para cálculos en tiempo real
  const horaSalida = watch("horaSalida")
  const horaRetorno = watch("horaRetorno")
  const horasMinimas = watch("horasMinimas")
  const precioPorHora = watch("precioPorHora")
  const modoIGVCotizacion = watch("modoIGVCotizacion")
  const horometroInicial = watch("horometroInicial")
  const horometroFinal = watch("horometroFinal")
  const operadorId = watch("operadorId")
  const equipoId = watch("equipoId")
  const equipoSeleccionado = equipos.find((equipo) => equipo.id === equipoId)
  const operadorSeleccionado = operadores.find(
    (operador) => operador.id === operadorId
  )
  const horasMinimasNumero = decimalDesdeCampo(horasMinimas)
  const precioPorHoraNumero = decimalDesdeCampo(precioPorHora)

  const horasServicio = useMemo(
    () => calcularHorasServicio(horaSalida, horaRetorno),
    [horaSalida, horaRetorno]
  )
  const importeAlquiler = calcularImporteAlquiler(
    horasServicio,
    horasMinimasNumero,
    precioPorHoraNumero
  )
  const totalesCotizacion =
    importeAlquiler == null
      ? null
      : calcularCotizacion(importeAlquiler, modoIGVCotizacion)

  const horasUsoMaquina = useMemo(() => {
    const inicial =
      typeof horometroInicial === "number"
        ? horometroInicial
        : Number(horometroInicial ?? 0)
    const final =
      typeof horometroFinal === "number"
        ? horometroFinal
        : Number(horometroFinal ?? 0)
    return calcularHorasUsoMaquina(
      Number.isFinite(inicial) && inicial > 0 ? inicial : null,
      Number.isFinite(final) && final > 0 ? final : null
    )
  }, [horometroInicial, horometroFinal])

  const onSubmit = (data: GuiaAlquilerFormData) => {
    startTransition(async () => {
      const normalizedData = {
        ...data,
        fechaInicio:
          data.fechaInicio instanceof Date
            ? data.fechaInicio
            : new Date(data.fechaInicio as any),
        fechaFin:
          data.fechaFin instanceof Date
            ? data.fechaFin
            : new Date(data.fechaFin as any),
      }

      const res = esEdicion
        ? await actualizarGuiaAlquilerAction(guia!.id, normalizedData)
        : await registrarGuiaAlquilerAction(normalizedData)

      if (res.success) {
        toast.success(res.message)
        onOpenChange(false)
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[90vw] max-w-4xl overflow-y-auto p-0 sm:max-w-4xl">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle className="text-xl">
            {esEdicion ? "Editar Guía de Alquiler" : "Nueva Guía de Alquiler"}
          </DialogTitle>
          <DialogDescription>
            Complete los datos del servicio de alquiler de maquinaria.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-6 py-5">
          {/* ===== SECCIÓN: GENERAL ===== */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Información general</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>N° Guía *</Label>
                <Input {...register("numeroGuia")} />
                {errors.numeroGuia && (
                  <p className="text-xs text-destructive">
                    {errors.numeroGuia.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Equipo *</Label>
                <Select
                  value={watch("equipoId") ?? ""}
                  onValueChange={(v) =>
                    setValue("equipoId", v || "", {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue>
                      {equipoSeleccionado
                        ? `${equipoSeleccionado.nombre}`
                        : "Seleccionar equipo"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {equipos.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.equipoId && (
                  <p className="text-xs text-destructive">
                    {errors.equipoId.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Fecha inicio *</Label>
                <Input
                  type="date"
                  value={
                    watch("fechaInicio") instanceof Date
                      ? new Date(watch("fechaInicio"))
                          .toISOString()
                          .slice(0, 10)
                      : ""
                  }
                  onChange={(e) =>
                    setValue(
                      "fechaInicio",
                      e.target.value ? new Date(e.target.value) : new Date(),
                      {
                        shouldValidate: true,
                        shouldDirty: true,
                      }
                    )
                  }
                />
              </div>

              <div className="space-y-1">
                <Label>Fecha fin *</Label>
                <Input
                  type="date"
                  value={
                    watch("fechaFin") instanceof Date
                      ? new Date(watch("fechaFin")).toISOString().slice(0, 10)
                      : ""
                  }
                  onChange={(e) =>
                    setValue(
                      "fechaFin",
                      e.target.value ? new Date(e.target.value) : new Date(),
                      {
                        shouldValidate: true,
                        shouldDirty: true,
                      }
                    )
                  }
                />
              </div>

              <div className="col-span-2 space-y-1">
                <Label>Descripción del servicio</Label>
                <Input {...register("descripcionServicio")} />
              </div>

              <div className="space-y-1">
                <Label>Solicitante</Label>
                <Input {...register("solicitante")} />
              </div>

              <div className="space-y-1">
                <Label>Lugar del servicio</Label>
                <Input {...register("lugarServicio")} />
              </div>
            </div>
          </section>

          {/* ===== SECCIÓN: OPERADOR ===== */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Operador</h3>
            {/* Cambiamos a 1 columna o ajustamos el grid */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Operador registrado</Label>
                <Select
                  value={operadorId ?? "ninguno"}
                  onValueChange={(v) =>
                    setValue("operadorId", v === "ninguno" ? null : v, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  disabled={!!watch("nombreOperadorExterno")}
                >
                  {/* Agregamos w-full por seguridad */}
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {!operadorId || operadorId === "ninguno"
                        ? "Sin operador"
                        : operadorSeleccionado
                          ? `${operadorSeleccionado.nombres} ${operadorSeleccionado.apellidos}`
                          : "Seleccionar operador"}
                    </SelectValue>
                  </SelectTrigger>
                  {/* Forzamos al contenido a adaptarse o tener un ancho mínimo mayor */}
                  <SelectContent className="min-w-[280px]">
                    <SelectItem value="ninguno">Sin operador</SelectItem>
                    {operadores.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.nombres} {o.apellidos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Operador externo (nombre)</Label>
                <Input
                  {...register("nombreOperadorExterno")}
                  placeholder="Dejar vacío si usa operador registrado"
                  disabled={!!operadorId}
                />
              </div>
            </div>
          </section>

          {/* ===== SECCIÓN: HORARIOS ===== */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Horarios del servicio</h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label>Hora salida</Label>
                <Input type="time" {...register("horaSalida")} />
              </div>
              <div className="space-y-1">
                <Label>Hora inicio</Label>
                <Input type="time" {...register("horaInicio")} />
              </div>
              <div className="space-y-1">
                <Label>Hora finalización</Label>
                <Input type="time" {...register("horaFinalizacion")} />
              </div>
              <div className="space-y-1">
                <Label>Hora retorno</Label>
                <Input type="time" {...register("horaRetorno")} />
              </div>
            </div>

            <div className="rounded-md bg-muted p-3 text-sm">
              <span className="text-muted-foreground">Horas de servicio:</span>{" "}
              <span className="font-semibold">
                {horasServicio != null ? `${horasServicio} h` : "—"}
              </span>
              <span className="ml-4 text-muted-foreground">
                (retorno − salida)
              </span>
            </div>
          </section>

          {/* ===== SECCIÓN: HORÓMETRO ===== */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Horómetro</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Horómetro inicial</Label>
                <Input
                  type="number"
                  step="0.1"
                  {...register("horometroInicial")}
                />
              </div>
              <div className="space-y-1">
                <Label>Horómetro final</Label>
                <Input
                  type="number"
                  step="0.1"
                  {...register("horometroFinal")}
                />
              </div>
              <div className="space-y-1">
                <Label>Horas de uso</Label>
                <Input
                  readOnly
                  value={
                    horasUsoMaquina != null
                      ? formatNumero(horasUsoMaquina, 1)
                      : ""
                  }
                />
              </div>
            </div>
          </section>

          {/* ===== SECCIÓN: COBRO ===== */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Condiciones de cobro</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Horas mínimas</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  {...register("horasMinimas")}
                />
              </div>
              <div className="space-y-1">
                <Label>Precio por hora</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("precioPorHora")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label>N° de cotización</Label>
                <Input
                  maxLength={50}
                  placeholder="Opcional"
                  {...register("numeroCotizacion")}
                />
                {errors.numeroCotizacion && (
                  <p className="text-xs text-destructive">
                    {errors.numeroCotizacion.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label>Modo de IGV</Label>
                <Select
                  value={modoIGVCotizacion}
                  onValueChange={(value) =>
                    setValue(
                      "modoIGVCotizacion",
                      (value ?? "SIN_IGV") as GuiaAlquilerFormData["modoIGVCotizacion"],
                      { shouldDirty: true, shouldValidate: true }
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SIN_IGV">Sin IGV</SelectItem>
                    <SelectItem value="CON_IGV">Agregar IGV (18%)</SelectItem>
                    <SelectItem value="IGV_INCLUIDO">IGV incluido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 rounded-md border bg-muted/40 p-4 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="text-muted-foreground">
                  Horas facturables
                </span>
                <span className="font-medium">
                  {horasServicio == null && horasMinimasNumero == null
                    ? "—"
                    : `${Math.max(
                        horasServicio ?? 0,
                        horasMinimasNumero ?? 0
                      )} h`}
                </span>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <span className="text-muted-foreground">
                  {modoIGVCotizacion === "IGV_INCLUIDO"
                    ? "Importe calculado (IGV incluido)"
                    : "Subtotal calculado"}
                </span>
                <span className="font-medium">
                  {totalesCotizacion
                    ? formatMoneda(importeAlquiler)
                    : "Completa las horas y el precio por hora"}
                </span>
              </div>
              {totalesCotizacion && (
                <>
                  {modoIGVCotizacion === "IGV_INCLUIDO" && (
                    <div className="flex flex-wrap justify-between gap-2">
                      <span className="text-muted-foreground">
                        Subtotal sin IGV
                      </span>
                      <span className="font-medium">
                        {formatMoneda(totalesCotizacion.subtotal)}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="text-muted-foreground">IGV (18%)</span>
                    <span className="font-medium">
                      {formatMoneda(totalesCotizacion.igv)}
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2 border-t pt-2">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold">
                      {formatMoneda(totalesCotizacion.total)}
                    </span>
                  </div>
                </>
              )}
              {horasServicio != null &&
                horasMinimasNumero != null &&
                horasServicio < horasMinimasNumero && (
                  <p className="text-xs text-muted-foreground">
                    Se aplican las horas mínimas para calcular el importe.
                  </p>
                )}
            </div>
          </section>

          {/* ===== SECCIÓN: ESTADO Y OBS ===== */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Estado y observaciones</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Estado</Label>
                <Select
                  value={watch("estado")}
                  onValueChange={(v) => setValue("estado", v as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EN_PROCESO">En proceso</SelectItem>
                    <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                    <SelectItem value="ANULADO">Anulado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Observaciones</Label>
                <Textarea {...register("observaciones")} rows={3} />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Guardando..."
                : esEdicion
                  ? "Guardar cambios"
                  : "Registrar guía"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
