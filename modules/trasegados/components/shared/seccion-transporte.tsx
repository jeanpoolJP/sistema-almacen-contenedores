// modules\trasegados\components\shared\seccion-transporte.tsx

"use client"

import { Loader2Icon, LockIcon, TruckIcon } from "lucide-react"
import { useEffect } from "react"
import type { FieldValues, Path, UseFormReturn } from "react-hook-form"

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
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

import { FormSection } from "./form-section"
import { UppercaseInput } from "./uppercase-input"
import {
  buscarConductorAction,
  buscarEmpresaTransporteAction,
  buscarVehiculoAction,
} from "../../actions/buscar-entidades.action"
import { useEntidadLookup } from "../../hooks/use-entidad-lookup"
import { ETIQUETAS_TIPO_VEHICULO } from "../../types"

/**
 * Prefijo del path dentro del form.
 * Ej: "ingreso" | "salida" o vacío para campos raíces.
 */
type Prefijo = "ingreso" | "salida" | ""

interface SeccionTransporteProps<T extends FieldValues> {
  form: UseFormReturn<T>
  prefijo?: Prefijo
}

export function SeccionTransporte<T extends FieldValues>({
  form,
  prefijo = "",
}: SeccionTransporteProps<T>) {
  // Helper para construir el path tipado
  const p = (suffix: string) =>
    `${prefijo ? `${prefijo}.` : ""}${suffix}` as Path<T>

  const empresaLookup = useEntidadLookup<
    string,
    {
      id: number
      ruc: string
      nombre: string
      telefono: string | null
      contactoLogistico: string | null
      nombreEncargado: string | null
    }
  >(buscarEmpresaTransporteAction)

  const vehiculoLookup = useEntidadLookup<
    string,
    {
      id: number
      placa: string
      tipo: "PORTA_CONTENEDORES" | "CAMA_BAJA" | "OTRO" | null
      descripcion: string | null
    }
  >(buscarVehiculoAction)

  const conductorLookup = useEntidadLookup<
    string,
    {
      id: number
      numeroLicencia: string
      nombreCompleto: string
      telefono: string | null
    }
  >(buscarConductorAction)

  // ---------- EMPRESA ----------
  const rucPath = p("empresaTransporte.ruc")
  const rucValue = form.watch(rucPath)

  useEffect(() => {
    const t = setTimeout(() => {
      if (rucValue && String(rucValue).length >= 8)
        empresaLookup.buscar(String(rucValue))
      else empresaLookup.reset()
    }, 500)
    return () => clearTimeout(t)
  }, [rucValue, empresaLookup.buscar, empresaLookup.reset])

  useEffect(() => {
    if (empresaLookup.encontrada && empresaLookup.data) {
      const d = empresaLookup.data
      form.setValue(p("empresaTransporte.nombre") as any, d.nombre as any)
      form.setValue(
        p("empresaTransporte.telefono") as any,
        (d.telefono ?? "") as any
      )
      form.setValue(
        p("empresaTransporte.contactoLogistico") as any,
        (d.contactoLogistico ?? "") as any
      )
      form.setValue(
        p("empresaTransporte.nombreEncargado") as any,
        (d.nombreEncargado ?? "") as any
      )
    }
  }, [empresaLookup.encontrada, empresaLookup.data, form])

  const empresaBloqueada = empresaLookup.encontrada && !!empresaLookup.data

  // ---------- VEHÍCULO ----------
  const placaPath = p("vehiculo.placa")
  const placaValue = form.watch(placaPath)

  useEffect(() => {
    const t = setTimeout(() => {
      if (placaValue && String(placaValue).length >= 7)
        vehiculoLookup.buscar(String(placaValue))
      else vehiculoLookup.reset()
    }, 500)
    return () => clearTimeout(t)
  }, [placaValue, vehiculoLookup.buscar, vehiculoLookup.reset])

  useEffect(() => {
    if (vehiculoLookup.encontrada && vehiculoLookup.data) {
      const d = vehiculoLookup.data
      form.setValue(p("vehiculo.tipo") as any, d.tipo as any)
      form.setValue(
        p("vehiculo.descripcion") as any,
        (d.descripcion ?? "") as any
      )
    }
  }, [vehiculoLookup.encontrada, vehiculoLookup.data, form])

  const vehiculoBloqueado = vehiculoLookup.encontrada && !!vehiculoLookup.data

  // ---------- CONDUCTOR ----------
  const licenciaPath = p("conductor.numeroLicencia")
  const licenciaValue = form.watch(licenciaPath)

  useEffect(() => {
    const t = setTimeout(() => {
      if (licenciaValue && String(licenciaValue).length >= 9)
        conductorLookup.buscar(String(licenciaValue))
      else conductorLookup.reset()
    }, 500)
    return () => clearTimeout(t)
  }, [licenciaValue, conductorLookup.buscar, conductorLookup.reset])

  useEffect(() => {
    if (conductorLookup.encontrada && conductorLookup.data) {
      const d = conductorLookup.data
      form.setValue(
        p("conductor.nombreCompleto") as any,
        d.nombreCompleto as any
      )
      form.setValue(p("conductor.telefono") as any, (d.telefono ?? "") as any)
    }
  }, [conductorLookup.encontrada, conductorLookup.data, form])

  const conductorBloqueado =
    conductorLookup.encontrada && !!conductorLookup.data

  return (
    <FormSection
      title="Información del transporte"
      description={
        prefijo === "ingreso"
          ? "Empresa, vehículo y conductor responsables del ingreso."
          : "Empresa, vehículo y conductor responsables de la salida."
      }
      icon={<TruckIcon className="size-4" />}
    >
      {/* EMPRESA */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground">
          Empresa de transporte
        </h4>
        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            control={form.control}
            name={p("empresaTransporte.ruc") as any}
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel>
                  RUC <span className="text-destructive">*</span>
                </FormLabel>
                <div className="pointer-events-none absolute top-0 right-0 flex items-center gap-1.5 text-xs">
                  {empresaLookup.buscando && (
                    <Loader2Icon className="size-3 animate-spin text-muted-foreground" />
                  )}
                  {empresaBloqueada && (
                    <span className="inline-flex items-center gap-1 font-normal text-amber-600">
                      <LockIcon className="size-3" />
                      Encontrada
                    </span>
                  )}
                  {!empresaBloqueada && rucValue && !empresaLookup.buscando && (
                    <span className="font-normal text-muted-foreground">
                      Se creará al guardar
                    </span>
                  )}
                </div>
                <FormControl>
                  <UppercaseInput
                    placeholder="20123456789"
                    maxLength={11}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={p("empresaTransporte.nombre") as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nombre <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <UppercaseInput
                    placeholder="TRANSPORTES S.A.C."
                    disabled={empresaBloqueada}
                    className={cn(empresaBloqueada && "bg-muted")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={p("empresaTransporte.telefono") as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <UppercaseInput
                    placeholder="999 999 999"
                    disabled={empresaBloqueada}
                    className={cn(empresaBloqueada && "bg-muted")}
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
            name={p("empresaTransporte.contactoLogistico") as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contacto logístico</FormLabel>
                <FormControl>
                  <UppercaseInput
                    placeholder="NOMBRE DEL CONTACTO"
                    disabled={empresaBloqueada}
                    className={cn(empresaBloqueada && "bg-muted")}
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
            name={p("empresaTransporte.nombreEncargado") as any}
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Nombre del encargado</FormLabel>
                <FormControl>
                  <UppercaseInput
                    placeholder="NOMBRE DEL ENCARGADO"
                    disabled={empresaBloqueada}
                    className={cn(empresaBloqueada && "bg-muted")}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <Separator className="my-6" />

      {/* VEHÍCULO */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground">
          Vehículo
        </h4>
        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            control={form.control}
            name={p("vehiculo.placa") as any}
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel>
                  Placa <span className="text-destructive">*</span>
                </FormLabel>
                <div className="pointer-events-none absolute top-0 right-0 flex items-center gap-1.5 text-xs">
                  {vehiculoLookup.buscando && (
                    <Loader2Icon className="size-3 animate-spin text-muted-foreground" />
                  )}
                  {vehiculoBloqueado && (
                    <span className="inline-flex items-center gap-1 font-normal text-amber-600">
                      <LockIcon className="size-3" />
                      Encontrado
                    </span>
                  )}
                  {!vehiculoBloqueado &&
                    placaValue &&
                    !vehiculoLookup.buscando && (
                      <span className="font-normal text-muted-foreground">
                        Se creará al guardar
                      </span>
                    )}
                </div>
                <FormControl>
                  <UppercaseInput placeholder="ABC-123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={p("vehiculo.tipo") as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange(value === "NINGUNO" ? null : value)
                  }
                  value={field.value ?? "NINGUNO"}
                  disabled={vehiculoBloqueado}
                >
                  <FormControl>
                    <SelectTrigger
                      className={cn(vehiculoBloqueado && "bg-muted")}
                    >
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="NINGUNO">Sin especificar</SelectItem>
                    {Object.entries(ETIQUETAS_TIPO_VEHICULO).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={p("vehiculo.descripcion") as any}
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <UppercaseInput
                    placeholder="DESCRIPCIÓN DEL VEHÍCULO"
                    disabled={vehiculoBloqueado}
                    className={cn(vehiculoBloqueado && "bg-muted")}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <Separator className="my-6" />

      {/* CONDUCTOR */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground">
          Conductor
        </h4>
        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            control={form.control}
            name={p("conductor.numeroLicencia") as any}
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel>
                  Número de licencia <span className="text-destructive">*</span>
                </FormLabel>
                <div className="pointer-events-none absolute top-0 right-0 flex items-center gap-1.5 text-xs">
                  {conductorLookup.buscando && (
                    <Loader2Icon className="size-3 animate-spin text-muted-foreground" />
                  )}
                  {conductorBloqueado && (
                    <span className="inline-flex items-center gap-1 font-normal text-amber-600">
                      <LockIcon className="size-3" />
                      Encontrado
                    </span>
                  )}
                  {!conductorBloqueado &&
                    licenciaValue &&
                    !conductorLookup.buscando && (
                      <span className="font-normal text-muted-foreground">
                        Se creará al guardar
                      </span>
                    )}
                </div>
                <FormControl>
                  <UppercaseInput placeholder="Q12345678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={p("conductor.nombreCompleto") as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nombre completo <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <UppercaseInput
                    placeholder="JUAN PÉREZ"
                    disabled={conductorBloqueado}
                    className={cn(conductorBloqueado && "bg-muted")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={p("conductor.telefono") as any}
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <UppercaseInput
                    placeholder="999 999 999"
                    disabled={conductorBloqueado}
                    className={cn(conductorBloqueado && "bg-muted")}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </FormSection>
  )
}
