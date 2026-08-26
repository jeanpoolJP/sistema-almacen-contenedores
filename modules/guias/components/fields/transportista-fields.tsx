"use client"

import { useState, useTransition } from "react"
import { useFormContext } from "react-hook-form"
import {
  CheckCircle2,
  Loader2,
  PackagePlus,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"

import {
  buscarEmpresaTransportePorNombreAction,
  buscarVehiculoPorPlacaAction,
  buscarConductorPorLicenciaAction,
} from "../../guia.lookup.actions"

type TransportistaFieldsProps = {
  prefix: string
}

type EstadoBusqueda =
  | "idle"
  | "buscando"
  | "existente"
  | "nuevo"

export function TransportistaFields({
  prefix,
}: TransportistaFieldsProps) {
  const {
    control,
    setValue,
  } = useFormContext()

  // ============================================================
  // ESTADOS DE BÚSQUEDA
  // ============================================================

  const [
    estadoEmpresa,
    setEstadoEmpresa,
  ] = useState<EstadoBusqueda>("idle")

  const [
    estadoVehiculo,
    setEstadoVehiculo,
  ] = useState<EstadoBusqueda>("idle")

  const [
    estadoConductor,
    setEstadoConductor,
  ] = useState<EstadoBusqueda>("idle")

  const [
    isPending,
    startTransition,
  ] = useTransition()

  // ============================================================
  // BUSCAR EMPRESA
  // ============================================================

  function handleBlurEmpresa(
    nombre: string,
  ) {
    const nombreLimpio =
      nombre.trim()

    if (!nombreLimpio) {
      setEstadoEmpresa("idle")
      return
    }

    setEstadoEmpresa("buscando")

    startTransition(() => {
      buscarEmpresaTransportePorNombreAction(
        nombreLimpio,
      ).then((res) => {
        if (
          res.encontrado &&
          res.data
        ) {
          setEstadoEmpresa(
            "existente",
          )
        } else {
          setEstadoEmpresa("nuevo")
        }
      })
    })
  }

  // ============================================================
  // BUSCAR VEHÍCULO POR PLACA
  // ============================================================

  function handleBlurPlaca(
    placa: string,
  ) {
    const placaLimpia =
      placa.trim().toUpperCase()

    if (!placaLimpia) {
      setEstadoVehiculo("idle")
      return
    }

    setEstadoVehiculo("buscando")

    startTransition(() => {
      buscarVehiculoPorPlacaAction(
        placaLimpia,
      ).then((res) => {
        if (
          res.encontrado &&
          res.data
        ) {
          setEstadoVehiculo(
            "existente",
          )
        } else {
          setEstadoVehiculo("nuevo")
        }
      })
    })
  }

  // ============================================================
  // BUSCAR CONDUCTOR POR LICENCIA
  // ============================================================

  function handleBlurLicencia(
    licencia: string,
  ) {
    const licenciaLimpia =
      licencia.trim()

    if (!licenciaLimpia) {
      setEstadoConductor("idle")
      return
    }

    setEstadoConductor("buscando")

    startTransition(() => {
      buscarConductorPorLicenciaAction(
        licenciaLimpia,
      ).then((res) => {
        if (
          res.encontrado &&
          res.data
        ) {
          setValue(
            `${prefix}.conductorNombre`,
            res.data.nombreCompleto,
            {
              shouldValidate: true,
            },
          )

          setEstadoConductor(
            "existente",
          )
        } else {
          setEstadoConductor("nuevo")

          setValue(
            `${prefix}.conductorNombre`,
            "",
          )
        }
      })
    })
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-4">

      {/* ======================================================
          EMPRESA DE TRANSPORTE
      ====================================================== */}

      <FormField
        control={control}
        name={`${prefix}.empresaNombre`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Empresa de transporte
            </FormLabel>

            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  placeholder="Razón social"
                  onBlur={(e) => {
                    field.onBlur()

                    handleBlurEmpresa(
                      e.target.value,
                    )
                  }}
                />

                {isPending &&
                  estadoEmpresa ===
                    "buscando" && (
                    <Loader2
                      className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
                    />
                  )}
              </div>
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />

      {estadoEmpresa ===
        "existente" && (
        <Badge
          variant="outline"
          className="gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700"
        >
          <CheckCircle2 className="size-3.5" />
          Empresa de transporte ya registrada
        </Badge>
      )}

      {estadoEmpresa ===
        "nuevo" && (
        <Badge
          variant="outline"
          className="gap-1.5 border-amber-200 bg-amber-50 text-amber-700"
        >
          <PackagePlus className="size-3.5" />
          Empresa nueva, se registrará
        </Badge>
      )}

      {/* ======================================================
          PLACA
      ====================================================== */}

      <FormField
        control={control}
        name={`${prefix}.placa`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Placa
            </FormLabel>

            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  className="uppercase"
                  placeholder="ABC-123"
                  onChange={(e) =>
                    field.onChange(
                      e.target.value.toUpperCase(),
                    )
                  }
                  onBlur={(e) => {
                    field.onBlur()

                    handleBlurPlaca(
                      e.target.value,
                    )
                  }}
                />

                {isPending &&
                  estadoVehiculo ===
                    "buscando" && (
                    <Loader2
                      className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
                    />
                  )}
              </div>
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />

      {estadoVehiculo ===
        "existente" && (
        <Badge
          variant="outline"
          className="gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700"
        >
          <CheckCircle2 className="size-3.5" />
          Vehículo ya registrado
        </Badge>
      )}

      {estadoVehiculo ===
        "nuevo" && (
        <Badge
          variant="outline"
          className="gap-1.5 border-amber-200 bg-amber-50 text-amber-700"
        >
          <PackagePlus className="size-3.5" />
          Vehículo nuevo, se registrará
        </Badge>
      )}

      {/* ======================================================
          LICENCIA
      ====================================================== */}

      <FormField
        control={control}
        name={`${prefix}.numeroLicencia`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Número de licencia
            </FormLabel>

            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  placeholder="Ej: Q12345678"
                  onBlur={(e) => {
                    field.onBlur()

                    handleBlurLicencia(
                      e.target.value,
                    )
                  }}
                />

                {isPending &&
                  estadoConductor ===
                    "buscando" && (
                    <Loader2
                      className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
                    />
                  )}
              </div>
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />

      {estadoConductor ===
        "existente" && (
        <Badge
          variant="outline"
          className="gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700"
        >
          <CheckCircle2 className="size-3.5" />
          Conductor ya registrado
        </Badge>
      )}

      {estadoConductor ===
        "nuevo" && (
        <Badge
          variant="outline"
          className="gap-1.5 border-amber-200 bg-amber-50 text-amber-700"
        >
          <PackagePlus className="size-3.5" />
          Conductor nuevo, se registrará
        </Badge>
      )}

      {/* ======================================================
          NOMBRE DEL CONDUCTOR
      ====================================================== */}

      <FormField
        control={control}
        name={`${prefix}.conductorNombre`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Nombre del conductor
            </FormLabel>

            <FormControl>
              <Input
                {...field}
                readOnly={
                  estadoConductor ===
                  "existente"
                }
                className={
                  estadoConductor ===
                  "existente"
                    ? "bg-muted"
                    : undefined
                }
                placeholder="Nombre completo"
              />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />

    </div>
  )
}