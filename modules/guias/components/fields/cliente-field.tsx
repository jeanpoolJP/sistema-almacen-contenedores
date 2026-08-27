// modules/guias/components/fields/cliente-field.tsx

"use client"

import { useState, useTransition } from "react"
import { useFormContext } from "react-hook-form"
import { CheckCircle2, Loader2, UserPlus } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"

import { buscarClientePorDocumentoAction } from "../../guia.lookup.actions"

type EstadoBusqueda = "idle" | "buscando" | "existente" | "nuevo"

/**
 * Sección "Cliente" del formulario de creación de guía.
 * Al perder foco el número de documento, busca si el cliente ya
 * existe; si existe autocompleta el nombre (de solo lectura), si
 * no, permite registrar el nombre como cliente nuevo.
 */
export function ClienteField() {
  const { control, watch, setValue } = useFormContext()
  const [estado, setEstado] = useState<EstadoBusqueda>("idle")
  const [isPending, startTransition] = useTransition()

  const tipoDocumento = watch("cliente.tipoDocumento")
  const maxLength = tipoDocumento === "RUC" ? 11 : 8

  async function handleBlurDocumento(numero: string) {
    const limpio = numero.trim()

    const largoValido =
      (tipoDocumento === "DNI" && limpio.length === 8) ||
      (tipoDocumento === "RUC" && limpio.length === 11)

    if (!largoValido) {
      setEstado("idle")
      return
    }

    setEstado("buscando")

    startTransition(() => {
      buscarClientePorDocumentoAction(limpio).then((res) => {
        if (res.encontrado && res.data) {
          setValue("cliente.nombreCompleto", res.data.nombreCompleto ?? "", {
            shouldValidate: true,
          })
          setEstado("existente")
        } else {
          setEstado("nuevo")
        }
      })
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[120px_1fr] gap-3">
        <FormField
          control={control}
          name="cliente.tipoDocumento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value)
                  setValue("cliente.numeroDocumento", "")
                  setValue("cliente.nombreCompleto", "")
                  setEstado("idle")
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="DNI">DNI</SelectItem>
                  <SelectItem value="RUC">RUC</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="cliente.numeroDocumento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de documento</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    maxLength={maxLength}
                    placeholder={
                      tipoDocumento === "RUC" ? "11 dígitos" : "8 dígitos"
                    }
                    onBlur={(e) => {
                      field.onBlur()
                      handleBlurDocumento(e.target.value)
                    }}
                  />
                  {isPending && (
                    <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {estado === "existente" && (
        <Badge
          variant="outline"
          className="gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700"
        >
          <CheckCircle2 className="size-3.5" />
          Cliente ya registrado
        </Badge>
      )}
      {estado === "nuevo" && (
        <Badge
          variant="outline"
          className="gap-1.5 border-amber-200 bg-amber-50 text-amber-700"
        >
          <UserPlus className="size-3.5" />
          Cliente nuevo, se registrará
        </Badge>
      )}

      <FormField
        control={control}
        name="cliente.nombreCompleto"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Nombre / Razon Social{" "}
              <span className="font-normal text-muted-foreground">
                (opcional)
              </span>
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                readOnly={estado === "existente"}
                className={estado === "existente" ? "bg-muted" : undefined}
                placeholder="Nombre o razón social del cliente"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
