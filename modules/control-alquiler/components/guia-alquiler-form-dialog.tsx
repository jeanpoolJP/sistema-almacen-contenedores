"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"
import { useEffect, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  actualizarGuiaAlquilerAction,
  crearGuiaAlquilerAction,
  obtenerOpcionesAlquilerAction,
} from "../actions/control-alquiler.actions"
import {
  guiaAlquilerSchema,
  type GuiaAlquilerFormInput,
  type GuiaAlquilerInput,
} from "../schemas/control-alquiler.schema"

type SuccessData<T> = T extends { success: true; data: infer Data }
  ? Data
  : never
type Opciones = SuccessData<
  Awaited<ReturnType<typeof obtenerOpcionesAlquilerAction>>
>
type Guia = {
  id: string
  numeroGuia: string
  fechaInicio: string
  fechaFin: string
  solicitante: string | null
  horaSalida: string
  horaInicio: string
  horaFinalizacion: string
  horaRetorno: string
  equipoId: string
  operadorId: string
  estado: "EN_PROCESO" | "FINALIZADO" | "ANULADO"
  observaciones: string | null
}

interface GuiaAlquilerFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guia: Guia | null
  opciones: Opciones | null
  onSuccess: () => void
}

const valoresIniciales: GuiaAlquilerInput = {
  numeroGuia: "",
  fechaInicio: "",
  fechaFin: "",
  solicitante: "",
  horaSalida: "",
  horaInicio: "",
  horaFinalizacion: "",
  horaRetorno: "",
  equipoId: "",
  operadorId: "",
  estado: "EN_PROCESO",
  observaciones: "",
}

const ETIQUETAS_ESTADO = {
  EN_PROCESO: "En proceso",
  FINALIZADO: "Finalizado",
  ANULADO: "Anulado",
} as const

export function GuiaAlquilerFormDialog({
  open,
  onOpenChange,
  guia,
  opciones,
  onSuccess,
}: GuiaAlquilerFormDialogProps) {
  const [isPending, startTransition] = useTransition()
  const form = useForm<GuiaAlquilerFormInput, unknown, GuiaAlquilerInput>({
    resolver: zodResolver(guiaAlquilerSchema),
    defaultValues: valoresIniciales,
  })
  const { reset } = form

  useEffect(() => {
    if (!open) return
    reset(
      guia
        ? {
            numeroGuia: guia.numeroGuia.replace(/^0+/, "") || "0",
            fechaInicio: guia.fechaInicio,
            fechaFin: guia.fechaFin,
            solicitante: guia.solicitante ?? "",
            horaSalida: guia.horaSalida,
            horaInicio: guia.horaInicio,
            horaFinalizacion: guia.horaFinalizacion,
            horaRetorno: guia.horaRetorno,
            equipoId: guia.equipoId,
            operadorId: guia.operadorId,
            estado: guia.estado,
            observaciones: guia.observaciones ?? "",
          }
        : valoresIniciales
    )
  }, [guia, open, reset])

  const onSubmit = form.handleSubmit((datos) => {
    startTransition(async () => {
      const result = guia
        ? await actualizarGuiaAlquilerAction({ ...datos, id: guia.id })
        : await crearGuiaAlquilerAction(datos)

      if (!result.success) {
        toast.error(result.message)
        return
      }

      toast.success(result.message)
      onSuccess()
      onOpenChange(false)
    })
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {guia ? "Editar guía de alquiler" : "Registrar guía de alquiler"}
          </DialogTitle>
          <DialogDescription>
            Ingresa la información del servicio. El número se guardará con seis
            dígitos y ceros a la izquierda.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-6" autoComplete="off">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="numeroGuia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de guía</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Ej. 125"
                        onChange={(event) =>
                          field.onChange(
                            event.target.value.replace(/\D/g, "").slice(0, 6)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="solicitante"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Solicitante</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={150} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fechaInicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de inicio</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fechaFin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de fin</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold">Horarios del servicio</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {(
                  [
                    ["horaSalida", "Hora de salida"],
                    ["horaInicio", "Hora de inicio"],
                    ["horaFinalizacion", "Hora de finalización"],
                    ["horaRetorno", "Hora de retorno"],
                  ] as const
                ).map(([name, label]) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </section>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="equipoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipo</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      items={opciones?.equipos.map((equipo) => ({
                        value: equipo.id,
                        label: equipo.nombre,
                      }))}
                      disabled={!opciones?.equipos.length}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un equipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {opciones?.equipos.map((equipo) => (
                          <SelectItem key={equipo.id} value={equipo.id}>
                            {equipo.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="operadorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operador</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      items={opciones?.operadores.map((operador) => ({
                        value: operador.id,
                        label: `${operador.nombres} ${operador.apellidos}`,
                      }))}
                      disabled={!opciones?.operadores.length}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un operador" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {opciones?.operadores.map((operador) => (
                          <SelectItem key={operador.id} value={operador.id}>
                            {operador.nombres} {operador.apellidos}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => {
                  const estadosDisponibles: Guia["estado"][] = [
                    "EN_PROCESO",
                    "FINALIZADO",
                  ]
                  if (field.value === "ANULADO") {
                    estadosDisponibles.push("ANULADO")
                  }

                  return (
                    <FormItem>
                      <FormLabel>Estado del servicio</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          if (
                            value === "EN_PROCESO" ||
                            value === "FINALIZADO" ||
                            value === "ANULADO"
                          ) {
                            field.onChange(value)
                          }
                        }}
                        items={estadosDisponibles.map((estado) => ({
                          value: estado,
                          label: ETIQUETAS_ESTADO[estado],
                        }))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {estadosDisponibles.map((estado) => (
                            <SelectItem key={estado} value={estado}>
                              {ETIQUETAS_ESTADO[estado]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
            </div>

            <FormField
              control={form.control}
              name="observaciones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      maxLength={1000}
                      rows={3}
                      placeholder="Agrega información relevante del servicio"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {opciones &&
              (opciones.equipos.length === 0 ||
                opciones.operadores.length === 0) && (
                <p className="text-sm text-destructive">
                  Para registrar una guía debe existir al menos un equipo y un
                  operador en la base de datos.
                </p>
              )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending || !opciones}>
                {isPending && (
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                )}
                {isPending ? "Guardando..." : "Guardar guía"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
