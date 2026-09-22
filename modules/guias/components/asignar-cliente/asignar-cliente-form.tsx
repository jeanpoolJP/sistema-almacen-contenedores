// modules\guias\components\asignar-cliente\asignar-cliente-form.tsx

"use client"

import { useEffect } from "react"

import { useForm } from "react-hook-form"

import { zodResolver } from "@hookform/resolvers/zod"

import { clienteSchema } from "@/modules/clientes/cliente.schema"

import type { ClienteFormData } from "@/modules/clientes/cliente.types"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type AsignarClienteFormProps = {
  documentoInicial?: string
  onSubmit: (data: ClienteFormData) => void
  disabled?: boolean
}

export function AsignarClienteForm({
  documentoInicial = "",
  onSubmit,
  disabled = false,
}: AsignarClienteFormProps) {
  const form = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),

    defaultValues: {
      tipoDocumento: "DNI",
      numeroDocumento: documentoInicial,
      nombreCompleto: "",
      telefono: "",
      observaciones: "",
      activo: true,
    },
  })

  useEffect(() => {
    form.setValue("numeroDocumento", documentoInicial)
  }, [documentoInicial, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="tipoDocumento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de documento</FormLabel>

              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                </FormControl>

                <SelectContent>
                  <SelectItem value="DNI">DNI</SelectItem>
                  <SelectItem value="RUC">RUC</SelectItem>
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="numeroDocumento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de documento</FormLabel>

              <FormControl>
                <Input {...field} maxLength={11} disabled={disabled} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nombreCompleto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre completo / Razón social</FormLabel>

              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Ingresa el nombre"
                  disabled={disabled}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="telefono"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono (opcional)</FormLabel>

              <FormControl>
                <Input
                  {...field}
                  placeholder="Número de teléfono"
                  disabled={disabled}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observaciones"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observaciones (opcional)</FormLabel>

              <FormControl>
                <Input
                  {...field}
                  placeholder="Observaciones"
                  disabled={disabled}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={disabled} className="w-full">
          Registrar cliente y asignar
        </Button>
      </form>
    </Form>
  )
}
