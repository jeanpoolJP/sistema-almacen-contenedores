// modules/guias/components/ingreso-guia/guia-ingreso-form.tsx
"use client"

import { useEffect } from "react"
import { useFormContext } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
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

import { ContenedorField } from "../fields/contenedor-field"
import { TransportistaFields } from "../fields/transportista-fields"
import { FechaHoraField } from "../fields/fecha-hora-field"

const SECTION_TITLE = "text-sm font-semibold text-foreground"

/**
 * Props del formulario compartido de ingreso.
 *
 * Debe usarse dentro de un `FormProvider` (react-hook-form). El padre define
 * schema, defaultValues y el handler de submit.
 *
 * @property formId - `id` del `<form>`; el botón del footer del diálogo lo usa en `form="..."`.
 * @property precioBase - Tarifas de configuración. En ESTANDAR se copian a los campos (REEFER: primer día = 40).
 * @property mostrarNumeroGuia - Si es `true`, muestra el campo número de guía (crear y editar lo activan).
 */
type GuiaIngresoFormProps = {
  formId: string
  onSubmit: React.FormEventHandler<HTMLFormElement>
  precioBase: {
    precioPrimerDia: number
    precioDiaAdicional: number
  } | null
  mostrarNumeroGuia?: boolean
}

/**
 * Formulario de ingreso de guía: transportista, contenedor, fecha/hora,
 * tipo de precio, IGV y observaciones.
 *
 * Tipos de precio:
 * - ESTANDAR: precios bloqueados; primer día 40 si el contenedor es REEFER.
 * - PERSONALIZADO: el usuario edita primer día y día adicional.
 * - ESPACIO_ALQUILADO: un solo campo `precioIngresoSalida`.
 *
 * El switch de factura alterna `tratamientoIGV` entre CON_IGV y SIN_IGV.
 */
export function GuiaIngresoForm({
  formId,
  onSubmit,
  precioBase,
  mostrarNumeroGuia = false,
}: GuiaIngresoFormProps) {
  const form = useFormContext()
  const tipoPrecio = form.watch("tipoPrecio")
  const tratamientoIGV = form.watch("tratamientoIGV")
  const tipoContenedor = form.watch("contenedor.tipo")

  useEffect(() => {
    if (tipoPrecio !== "ESTANDAR" || !precioBase) return

    form.setValue(
      "precioPrimerDia",
      tipoContenedor === "REEFER" ? 40 : precioBase.precioPrimerDia
    )
    form.setValue("precioDiaAdicional", precioBase.precioDiaAdicional)
  }, [form, precioBase, tipoContenedor, tipoPrecio])

  function handleTipoPrecioChange(
    value: "ESTANDAR" | "PERSONALIZADO" | "ESPACIO_ALQUILADO" | null
  ) {
    if (!value) return

    form.setValue("tipoPrecio", value)

    if (value === "ESTANDAR" && precioBase) {
      form.setValue(
        "precioPrimerDia",
        tipoContenedor === "REEFER" ? 40 : precioBase.precioPrimerDia
      )
      form.setValue("precioDiaAdicional", precioBase.precioDiaAdicional)
    }
  }

  return (
    <form id={formId} onSubmit={onSubmit} className="space-y-6 py-4">
      {mostrarNumeroGuia && (
        <FormField
          control={form.control}
          name="numeroGuia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de guía</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ej: 000123" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {mostrarNumeroGuia && <Separator />}

      <div className="space-y-3">
        <p className={SECTION_TITLE}>Transportista que entrega</p>
        <TransportistaFields prefix="transportistaIngreso" />
      </div>

      <Separator />

      <div className="space-y-3">
        <p className={SECTION_TITLE}>Contenedor</p>
        <ContenedorField />
      </div>

      <Separator />

      <FechaHoraField
        fechaName="fechaIngreso"
        horaName="horaIngreso"
        label="Fecha y hora de ingreso"
      />

      <Separator />

      <div className="space-y-3">
        <p className={SECTION_TITLE}>Precio de almacenamiento</p>

        <FormField
          control={form.control}
          name="tipoPrecio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de precio</FormLabel>
              <Select
                onValueChange={handleTipoPrecioChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ESTANDAR">Estándar</SelectItem>
                  <SelectItem value="PERSONALIZADO">Personalizado</SelectItem>
                  <SelectItem value="ESPACIO_ALQUILADO">
                    Espacio alquilado
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {tipoPrecio !== "ESPACIO_ALQUILADO" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="precioPrimerDia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio primer día (S/)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      disabled={tipoPrecio === "ESTANDAR"}
                      className={
                        tipoPrecio === "ESTANDAR" ? "bg-muted" : undefined
                      }
                      value={field.value ?? ""}
                      onChange={(event) =>
                        field.onChange(
                          event.target.value === ""
                            ? undefined
                            : Number(event.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="precioDiaAdicional"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio día adicional (S/)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      disabled={tipoPrecio === "ESTANDAR"}
                      className={
                        tipoPrecio === "ESTANDAR" ? "bg-muted" : undefined
                      }
                      value={field.value ?? ""}
                      onChange={(event) =>
                        field.onChange(
                          event.target.value === ""
                            ? undefined
                            : Number(event.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {tipoPrecio === "ESPACIO_ALQUILADO" && (
          <FormField
            control={form.control}
            name="precioIngresoSalida"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio de ingreso y salida (S/)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    value={field.value ?? ""}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value === ""
                          ? undefined
                          : Number(event.target.value)
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <Label>¿El cliente solicita factura (con IGV)?</Label>
            <p className="text-xs text-muted-foreground">
              Por defecto la guía no incluye IGV.
            </p>
          </div>
          <Switch
            checked={tratamientoIGV === "CON_IGV"}
            onCheckedChange={(checked) =>
              form.setValue("tratamientoIGV", checked ? "CON_IGV" : "SIN_IGV", {
                shouldValidate: true,
              })
            }
          />
        </div>
      </div>

      <Separator />

      <FormField
        control={form.control}
        name="observaciones"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Observaciones{" "}
              <span className="font-normal text-muted-foreground">
                (opcional)
              </span>
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                value={field.value ?? ""}
                placeholder="Notas adicionales sobre la guía"
                rows={3}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </form>
  )
}
