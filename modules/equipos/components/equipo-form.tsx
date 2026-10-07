"use client"

import { useActionState, useEffect } from "react"
import { LoaderCircle } from "lucide-react"
import { toast } from "sonner"

import type { Equipo } from "../equipos.types"
import { crearEquipo, editarEquipo } from "../equipos.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const inicial = { success: false, message: "" }
const tipos = [
  ["MONTACARGAS", "Montacargas"],
  ["STACKER", "Stacker"],
  ["OTRO", "Otro"],
] as const
const estados = [
  ["DISPONIBLE", "Disponible"],
  ["EN_REPARACION", "En reparación"],
  ["INOPERATIVO", "Inoperativo"],
] as const

export function EquipoForm({
  equipo,
  onSuccess,
}: {
  equipo?: Equipo
  onSuccess: () => void
}) {
  const action = equipo ? editarEquipo.bind(null, equipo.id) : crearEquipo
  const [state, formAction, pending] = useActionState(action, inicial)
  const errors = state.fieldErrors ?? {}

  useEffect(() => {
    if (!state.success) return
    toast.success(state.message)
    onSuccess()
  }, [state.success, state.message, onSuccess])

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Código" name="codigo" error={errors.codigo?.[0]}>
          <Input
            id="codigo"
            name="codigo"
            defaultValue={equipo?.codigo}
            placeholder="Ej: EQ-001"
            maxLength={30}
            autoComplete="off"
            required
          />
        </Field>
        <Field label="Nombre" name="nombre" error={errors.nombre?.[0]}>
          <Input
            id="nombre"
            name="nombre"
            defaultValue={equipo?.nombre}
            placeholder="Nombre del equipo"
            maxLength={100}
            required
          />
        </Field>
        <Field label="Tipo" name="tipo" error={errors.tipo?.[0]}>
          <Select
            name="tipo"
            defaultValue={equipo?.tipo ?? "MONTACARGAS"}
            required
          >
            <SelectTrigger id="tipo" className="w-full">
              <SelectValue placeholder="Selecciona un tipo" />
            </SelectTrigger>
            <SelectContent>
              {tipos.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Estado" name="estado" error={errors.estado?.[0]}>
          <Select
            name="estado"
            defaultValue={equipo?.estado ?? "DISPONIBLE"}
            required
          >
            <SelectTrigger id="estado" className="w-full">
              <SelectValue placeholder="Selecciona un estado" />
            </SelectTrigger>
            <SelectContent>
              {estados.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Marca" name="marca" error={errors.marca?.[0]} optional>
          <Input
            id="marca"
            name="marca"
            defaultValue={equipo?.marca ?? ""}
            maxLength={60}
            placeholder="Ej: Toyota"
          />
        </Field>
        <Field label="Modelo" name="modelo" error={errors.modelo?.[0]} optional>
          <Input
            id="modelo"
            name="modelo"
            defaultValue={equipo?.modelo ?? ""}
            maxLength={60}
            placeholder="Ej: 8FGU25"
          />
        </Field>
        <Field label="Placa" name="placa" error={errors.placa?.[0]} optional>
          <Input
            id="placa"
            name="placa"
            defaultValue={equipo?.placa ?? ""}
            maxLength={20}
            placeholder="Placa o identificación"
          />
        </Field>
        <Field
          label="Capacidad de carga (t)"
          name="capacidadCarga"
          error={errors.capacidadCarga?.[0]}
          optional
        >
          <Input
            id="capacidadCarga"
            name="capacidadCarga"
            type="number"
            inputMode="decimal"
            min="0.01"
            max="9999.99"
            step="0.01"
            defaultValue={equipo?.capacidadCarga ?? ""}
            placeholder="Ej: 2.50"
          />
        </Field>
      </div>

      <Field
        label="Observaciones"
        name="observaciones"
        error={errors.observaciones?.[0]}
        optional
      >
        <Textarea
          id="observaciones"
          name="observaciones"
          defaultValue={equipo?.observaciones ?? ""}
          maxLength={1000}
          rows={3}
          placeholder="Agrega información relevante del equipo"
        />
      </Field>

      {state.message && !state.success && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      <div className="flex justify-end border-t pt-4">
        <Button type="submit" disabled={pending}>
          {pending && <LoaderCircle className="size-4 animate-spin" />}
          {equipo ? "Guardar cambios" : "Registrar equipo"}
        </Button>
      </div>
    </form>
  )
}

function Field({
  label,
  name,
  error,
  children,
  optional = false,
}: {
  label: string
  name: string
  error?: string
  children: React.ReactNode
  optional?: boolean
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={name}>{label}</Label>
        {optional && (
          <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            Opcional
          </span>
        )}
      </div>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
