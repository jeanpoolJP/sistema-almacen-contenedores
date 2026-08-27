// modules\conductores\components\conductor-form.tsx

"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"

import { conductorSchema } from "../conductores.schema"
import type { ConductorFormData } from "../conductores.types"

import { crearConductor, editarConductor } from "../conductores.actions"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ConductorFormProps = {
  conductor?: ConductorFormData & {
    id?: number
  }
  onSuccess?: () => void
}

export function ConductorForm({ conductor, onSuccess }: ConductorFormProps) {
  const esEdicion = Boolean(conductor?.id)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ConductorFormData>({
    resolver: zodResolver(conductorSchema),
    defaultValues: {
      nombreCompleto: conductor?.nombreCompleto ?? "",
      numeroLicencia: conductor?.numeroLicencia ?? "",
      telefono: conductor?.telefono ?? "",
    },
  })

  async function onSubmit(data: ConductorFormData) {
    const result = esEdicion
      ? await editarConductor(conductor!.id!, data)
      : await crearConductor(data)

    if (!result.success) {
      setError("root", {
        message: result.error,
      })

      return
    }

    reset()

    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Nombre completo */}
        <div className="space-y-2">
          <Label htmlFor="nombreCompleto">Nombre completo</Label>

          <Input
            id="nombreCompleto"
            placeholder="Nombre completo del conductor"
            disabled={isSubmitting}
            {...register("nombreCompleto")}
          />

          {errors.nombreCompleto && (
            <p className="text-sm text-destructive">
              {errors.nombreCompleto.message}
            </p>
          )}
        </div>

        {/* Número de licencia */}
        <div className="space-y-2">
          <Label htmlFor="numeroLicencia">Número de licencia</Label>

          <Input
            id="numeroLicencia"
            placeholder="Ej. Q12345678"
            disabled={isSubmitting}
            {...register("numeroLicencia")}
          />

          {errors.numeroLicencia && (
            <p className="text-sm text-destructive">
              {errors.numeroLicencia.message}
            </p>
          )}
        </div>

        {/* Teléfono */}
        <div className="space-y-2">
          <Label htmlFor="telefono">
            Teléfono
            <span className="ml-1 text-muted-foreground">(opcional)</span>
          </Label>

          <Input
            id="telefono"
            type="tel"
            placeholder="Ej. 982536102"
            disabled={isSubmitting}
            {...register("telefono")}
          />

          {errors.telefono && (
            <p className="text-sm text-destructive">
              {errors.telefono.message}
            </p>
          )}
        </div>
      </div>

      {/* ============================================================
          ERROR GENERAL
      ============================================================ */}

      {errors.root && (
        <p className="text-sm text-destructive">{errors.root.message}</p>
      )}

      {/* ============================================================
          BOTÓN
      ============================================================ */}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}

          {esEdicion ? "Actualizar conductor" : "Registrar conductor"}
        </Button>
      </div>
    </form>
  )
}
