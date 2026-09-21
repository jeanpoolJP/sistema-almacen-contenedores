// modules\trasegados\components\asignar-cliente\form-asignar-cliente.tsx

"use client"

import { Loader2Icon, LockIcon, SearchIcon, UserIcon } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  FormControl,
  FormDescription,
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
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import { UppercaseInput } from "../shared/uppercase-input"
import type { AsignarClienteInput } from "../../schemas/asignar-cliente.schema"

interface FormAsignarClienteProps {
  form: UseFormReturn<AsignarClienteInput, any, AsignarClienteInput>
  buscando: boolean
  clienteEncontrado: {
    id: number
    numeroDocumento: string
  } | null
  onBuscar: (numeroDocumento: string) => void
  onLimpiarBusqueda: () => void
}

export function FormAsignarCliente({
  form,
  buscando,
  clienteEncontrado,
  onBuscar,
  onLimpiarBusqueda,
}: FormAsignarClienteProps) {
  const bloqueado = !!clienteEncontrado

  // Watch del documento para saber cuándo habilitar el botón buscar
  const numeroDocumento = form.watch("numeroDocumento")
  const puedeBuscar = numeroDocumento.trim().length >= 8

  return (
    <div className="space-y-5">
      {/* Documento + botón buscar */}
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="tipoDocumento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Tipo de documento <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={bloqueado}
              >
                <FormControl>
                  <SelectTrigger className={cn(bloqueado && "bg-muted")}>
                    <SelectValue />
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
              <FormLabel className="flex items-center gap-2">
                Número de documento <span className="text-destructive">*</span>
                {buscando && (
                  <Loader2Icon className="size-3 animate-spin text-muted-foreground" />
                )}
                {bloqueado && (
                  <span className="inline-flex items-center gap-1 text-xs font-normal text-amber-600">
                    <LockIcon className="size-3" />
                    Cliente encontrado
                  </span>
                )}
              </FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    placeholder="20123456789"
                    maxLength={11}
                    disabled={bloqueado}
                    className={cn(bloqueado && "bg-muted")}
                    {...field}
                  />
                </FormControl>
                {!bloqueado && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={!puedeBuscar || buscando}
                    onClick={() => onBuscar(numeroDocumento)}
                    aria-label="Buscar cliente"
                  >
                    <SearchIcon className="size-4" />
                  </Button>
                )}
                {bloqueado && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onLimpiarBusqueda}
                  >
                    Cambiar
                  </Button>
                )}
              </div>
              {!bloqueado && puedeBuscar && !buscando && (
                <FormDescription className="text-xs">
                  Si no existe, se creará al guardar.
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Info del cliente encontrado */}
      {bloqueado && clienteEncontrado && (
        <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <UserIcon className="size-4 shrink-0" />
          <p>
            Cliente existente encontrado por documento{" "}
            <span className="font-mono font-medium">
              {clienteEncontrado.numeroDocumento}
            </span>
            . Los campos están bloqueados.
          </p>
        </div>
      )}

      {/* Datos del cliente */}
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="nombreCompleto"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>
                Nombre completo{" "}
                {!bloqueado && <span className="text-destructive">*</span>}
              </FormLabel>
              <FormControl>
                <UppercaseInput
                  placeholder="JUAN PÉREZ"
                  disabled={bloqueado}
                  className={cn(bloqueado && "bg-muted")}
                  value={field.value ?? ""}
                  onChange={field.onChange}
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
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <UppercaseInput
                  placeholder="999 999 999"
                  disabled={bloqueado}
                  className={cn(bloqueado && "bg-muted")}
                  value={field.value ?? ""}
                  onChange={field.onChange}
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
            <FormItem className="md:col-span-2">
              <FormLabel>Observaciones</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="OBSERVACIONES DEL CLIENTE..."
                  className={cn("resize-none uppercase")}
                  rows={3}
                  disabled={bloqueado}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
