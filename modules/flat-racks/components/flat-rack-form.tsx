// modules\flat-racks\components\flat-rack-form.tsx

"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"

import {
  createFlatRackAction,
  updateFlatRackAction,
} from "../flat-rack.actions"

import { createFlatRackSchema, updateFlatRackSchema } from "../flat-rack.schema"

import type { FlatRack } from "../flat-rack.types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type FlatRackFormProps = {
  flatRack?: FlatRack | null
  onSuccess?: () => void
}

type FlatRackFormData = {
  numero: string
  marca: string
}

export function FlatRackForm({ flatRack, onSuccess }: FlatRackFormProps) {
  const esEdicion = Boolean(flatRack)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FlatRackFormData>({
    resolver: zodResolver(
      esEdicion
        ? updateFlatRackSchema.omit({
            id: true,
          })
        : createFlatRackSchema
    ),
    defaultValues: {
      numero: flatRack?.numero ?? "",
      marca: flatRack?.marca ?? "",
    },
  })

  async function onSubmit(data: FlatRackFormData) {
    const result = esEdicion
      ? await updateFlatRackAction({
          id: flatRack!.id,
          ...data,
        })
      : await createFlatRackAction(data)

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
      {/* =====================================================
          DATOS DEL FLAT RACK
      ====================================================== */}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Número */}
        <div className="space-y-2">
          <Label htmlFor="numero">Número</Label>

          <Input
            id="numero"
            placeholder="Ej. ABCD1234567"
            autoComplete="off"
            {...register("numero")}
          />

          {errors.numero && (
            <p className="text-sm text-destructive">{errors.numero.message}</p>
          )}
        </div>

        {/* Marca */}
        <div className="space-y-2">
          <Label htmlFor="marca">Marca</Label>

          <Input
            id="marca"
            placeholder="Ej. CIMC"
            autoComplete="off"
            {...register("marca")}
          />

          {errors.marca && (
            <p className="text-sm text-destructive">{errors.marca.message}</p>
          )}
        </div>
      </div>

      {/* =====================================================
          INFORMACIÓN
      ====================================================== */}

      <div className="rounded-md border bg-muted/30 p-3">
        <p className="text-sm text-muted-foreground">
          El número y la marca se almacenarán automáticamente en mayúsculas.
        </p>
      </div>

      {/* =====================================================
          ERROR GENERAL
      ====================================================== */}

      {errors.root && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3">
          <p className="text-sm text-destructive">{errors.root.message}</p>
        </div>
      )}

      {/* =====================================================
          BOTONES
      ====================================================== */}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}

          {esEdicion ? "Actualizar Flat Rack" : "Registrar Flat Rack"}
        </Button>
      </div>
    </form>
  )
}
