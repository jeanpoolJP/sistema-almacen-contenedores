// modules\guias\components\fields\transportista-fields.tsx

"use client"

import { useState, useTransition } from "react"
import { useFormContext } from "react-hook-form"
import { CheckCircle2, Loader2, PackagePlus } from "lucide-react"

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
  buscarEmpresaTransportePorRucAction,
  buscarVehiculoPorPlacaAction,
  buscarConductorPorLicenciaAction,
} from "../../guia.lookup.actions"

type TransportistaFieldsProps = {
  prefix: string
}

type EstadoBusqueda = "idle" | "buscando" | "existente" | "nuevo"

export function TransportistaFields({ prefix }: TransportistaFieldsProps) {
  const { control, setValue } = useFormContext()

  // ============================================================
  // ESTADOS DE BÚSQUEDA
  // ============================================================

  const [estadoEmpresa, setEstadoEmpresa] = useState<EstadoBusqueda>("idle")

  const [estadoVehiculo, setEstadoVehiculo] = useState<EstadoBusqueda>("idle")

  const [estadoConductor, setEstadoConductor] = useState<EstadoBusqueda>("idle")

  const [isPending, startTransition] = useTransition()

  // ============================================================
  // BUSCAR EMPRESA POR RUC
  // ============================================================

  function handleBlurRuc(ruc: string) {
    const rucLimpio = ruc.trim()

    if (!rucLimpio) {
      setEstadoEmpresa("idle")
      return
    }

    setEstadoEmpresa("buscando")

    startTransition(() => {
      buscarEmpresaTransportePorRucAction(rucLimpio).then((res) => {
        if (res.encontrado && res.data) {
          // Empresa existente
          setEstadoEmpresa("existente")

          // Datos de la empresa
          setValue(`${prefix}.empresaNombre`, res.data.nombre, {
            shouldValidate: true,
          })

          setValue(`${prefix}.telefono`, res.data.telefono ?? "", {
            shouldValidate: true,
          })

          setValue(
            `${prefix}.contactoLogistico`,
            res.data.contactoLogistico ?? "",
            {
              shouldValidate: true,
            }
          )

          setValue(
            `${prefix}.nombreEncargado`,
            res.data.nombreEncargado ?? "",
            {
              shouldValidate: true,
            }
          )
        } else {
          // Empresa nueva
          setEstadoEmpresa("nuevo")

          // Permitimos registrar los datos manualmente
          setValue(`${prefix}.empresaNombre`, "", {
            shouldValidate: true,
          })

          setValue(`${prefix}.telefono`, "")
          setValue(`${prefix}.contactoLogistico`, "")
          setValue(`${prefix}.nombreEncargado`, "")
        }
      })
    })
  }

  // ============================================================
  // BUSCAR VEHÍCULO POR PLACA
  // ============================================================

  function handleBlurPlaca(placa: string) {
    const placaLimpia = placa.trim().toUpperCase()

    if (!placaLimpia) {
      setEstadoVehiculo("idle")
      return
    }

    setEstadoVehiculo("buscando")

    startTransition(() => {
      buscarVehiculoPorPlacaAction(placaLimpia).then((res) => {
        if (res.encontrado && res.data) {
          setEstadoVehiculo("existente")
        } else {
          setEstadoVehiculo("nuevo")
        }
      })
    })
  }

  // ============================================================
  // BUSCAR CONDUCTOR POR LICENCIA
  // ============================================================

  function handleBlurLicencia(licencia: string) {
    const licenciaLimpia = licencia.trim()

    if (!licenciaLimpia) {
      setEstadoConductor("idle")
      return
    }

    setEstadoConductor("buscando")

    startTransition(() => {
      buscarConductorPorLicenciaAction(licenciaLimpia).then((res) => {
        if (res.encontrado && res.data) {
          setValue(`${prefix}.conductorNombre`, res.data.nombreCompleto, {
            shouldValidate: true,
          })

          setEstadoConductor("existente")
        } else {
          setEstadoConductor("nuevo")

          setValue(`${prefix}.conductorNombre`, "")
        }
      })
    })
  }

  return (
    <div className="space-y-4">
      {/* ======================================================
          RUC
      ====================================================== */}

      <FormField
        control={control}
        name={`${prefix}.ruc`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>RUC</FormLabel>

            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  placeholder="20123456789"
                  maxLength={11}
                  inputMode="numeric"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 11)

                    field.onChange(value)
                  }}
                  onBlur={(e) => {
                    field.onBlur()
                    handleBlurRuc(e.target.value)
                  }}
                />

                {isPending && estadoEmpresa === "buscando" && (
                  <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />

      {estadoEmpresa === "existente" && (
        <Badge
          variant="outline"
          className="gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700"
        >
          <CheckCircle2 className="size-3.5" />
          Empresa de transporte ya registrada
        </Badge>
      )}

      {estadoEmpresa === "nuevo" && (
        <Badge
          variant="outline"
          className="gap-1.5 border-amber-200 bg-amber-50 text-amber-700"
        >
          <PackagePlus className="size-3.5" />
          Empresa nueva, completa sus datos
        </Badge>
      )}

      {/* ======================================================
          EMPRESA
      ====================================================== */}

      <FormField
        control={control}
        name={`${prefix}.empresaNombre`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Razón social</FormLabel>

            <FormControl>
              <Input
                {...field}
                readOnly={estadoEmpresa === "existente"}
                className={
                  estadoEmpresa === "existente" ? "bg-muted" : undefined
                }
                placeholder="Razón social de la empresa"
              />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />

      {/* ======================================================
          TELÉFONO
      ====================================================== */}

      <FormField
        control={control}
        name={`${prefix}.telefono`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Teléfono{" "}
              <span className="font-normal text-muted-foreground">
                (opcional)
              </span>
            </FormLabel>

            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                readOnly={estadoEmpresa === "existente"}
                className={
                  estadoEmpresa === "existente" ? "bg-muted" : undefined
                }
                placeholder="Número de teléfono"
              />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />

      {/* ======================================================
          CONTACTO LOGÍSTICO
      ====================================================== */}

      <FormField
        control={control}
        name={`${prefix}.contactoLogistico`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Contacto logístico / compras{" "}
              <span className="font-normal text-muted-foreground">
                (opcional)
              </span>
            </FormLabel>

            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                readOnly={estadoEmpresa === "existente"}
                className={
                  estadoEmpresa === "existente" ? "bg-muted" : undefined
                }
                placeholder="Nombre o contacto"
              />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />

      {/* ======================================================
          ENCARGADO
      ====================================================== */}

      <FormField
        control={control}
        name={`${prefix}.nombreEncargado`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Nombre del encargado{" "}
              <span className="font-normal text-muted-foreground">
                (opcional)
              </span>
            </FormLabel>

            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                readOnly={estadoEmpresa === "existente"}
                className={
                  estadoEmpresa === "existente" ? "bg-muted" : undefined
                }
                placeholder="Nombre del encargado"
              />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />

      {/* ======================================================
          PLACA
      ====================================================== */}

      <FormField
        control={control}
        name={`${prefix}.placa`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Placa</FormLabel>

            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  className="uppercase"
                  placeholder="ABC-123"
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  onBlur={(e) => {
                    field.onBlur()
                    handleBlurPlaca(e.target.value)
                  }}
                />

                {isPending && estadoVehiculo === "buscando" && (
                  <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />

      {estadoVehiculo === "existente" && (
        <Badge
          variant="outline"
          className="gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700"
        >
          <CheckCircle2 className="size-3.5" />
          Vehículo ya registrado
        </Badge>
      )}

      {estadoVehiculo === "nuevo" && (
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
            <FormLabel>Número de licencia</FormLabel>

            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  placeholder="Ej: Q12345678"
                  onBlur={(e) => {
                    field.onBlur()
                    handleBlurLicencia(e.target.value)
                  }}
                />

                {isPending && estadoConductor === "buscando" && (
                  <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />

      {estadoConductor === "existente" && (
        <Badge
          variant="outline"
          className="gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700"
        >
          <CheckCircle2 className="size-3.5" />
          Conductor ya registrado
        </Badge>
      )}

      {estadoConductor === "nuevo" && (
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
            <FormLabel>Nombre del conductor</FormLabel>

            <FormControl>
              <Input
                {...field}
                readOnly={estadoConductor === "existente"}
                className={
                  estadoConductor === "existente" ? "bg-muted" : undefined
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
