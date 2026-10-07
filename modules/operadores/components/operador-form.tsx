"use client"

import { useActionState, useEffect } from "react"
import { LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import type { Operador } from "../operadores.types"
import { crearOperador, editarOperador } from "../operadores.actions"
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

const inicial: {
  success: boolean
  message: string
  fieldErrors?: Record<string, string[]>
} = { success: false, message: "" }
const documentos = [
  ["DNI", "DNI"],
  ["CARNET_EXTRANJERIA", "Carné de extranjería"],
  ["PASAPORTE", "Pasaporte"],
  ["OTRO", "Otro"],
] as const

export function OperadorForm({
  operador,
  onSuccess,
}: {
  operador?: Operador | null
  onSuccess: () => void
}) {
  const action = operador
    ? editarOperador.bind(null, operador.id)
    : crearOperador
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
        <Field
          label="Tipo de documento"
          name="tipoDocumento"
          error={errors.tipoDocumento?.[0]}
        >
          <Select
            name="tipoDocumento"
            defaultValue={operador?.tipoDocumento ?? "DNI"}
            required
          >
            <SelectTrigger id="tipoDocumento" className="w-full">
              <SelectValue placeholder="Selecciona" />
            </SelectTrigger>
            <SelectContent>
              {documentos.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field
          label="Número de documento"
          name="numeroDocumento"
          error={errors.numeroDocumento?.[0]}
        >
          <Input
            id="numeroDocumento"
            name="numeroDocumento"
            defaultValue={operador?.numeroDocumento}
            maxLength={30}
            required
            autoComplete="off"
            placeholder="Ej: 12345678"
          />
        </Field>
        <Field label="Nombres" name="nombres" error={errors.nombres?.[0]}>
          <Input
            id="nombres"
            name="nombres"
            defaultValue={operador?.nombres}
            maxLength={100}
            required
            autoComplete="given-name"
            placeholder="Ingrese los nombres"
          />
        </Field>
        <Field label="Apellidos" name="apellidos" error={errors.apellidos?.[0]}>
          <Input
            id="apellidos"
            name="apellidos"
            defaultValue={operador?.apellidos}
            maxLength={100}
            required
            autoComplete="family-name"
            placeholder="Ingrese los apellidos"
          />
        </Field>
        <Field
          label="Teléfono"
          name="telefono"
          error={errors.telefono?.[0]}
          optional
        >
          <Input
            id="telefono"
            name="telefono"
            type="tel"
            defaultValue={operador?.telefono ?? ""}
            maxLength={20}
            autoComplete="tel"
            placeholder="Ej: +51 999 999 999"
          />
        </Field>
        <Field
          label="Licencia"
          name="licencia"
          error={errors.licencia?.[0]}
          optional
        >
          <Input
            id="licencia"
            name="licencia"
            defaultValue={operador?.licencia ?? ""}
            maxLength={30}
            autoComplete="off"
            placeholder="Ej: B1 / A3"
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
          defaultValue={operador?.observaciones ?? ""}
          maxLength={1000}
          rows={3}
          placeholder="Agregue observaciones relevantes"
        />
      </Field>
      {state.message && (
        <p
          role="alert"
          className={
            state.success
              ? "text-sm text-emerald-700"
              : "text-sm text-destructive"
          }
        >
          {state.message}
        </p>
      )}
      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="submit" disabled={pending}>
          {pending && <LoaderCircle className="size-4 animate-spin" />}
          {operador ? "Guardar cambios" : "Registrar operador"}
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
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Opcional
          </span>
        )}
      </div>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
