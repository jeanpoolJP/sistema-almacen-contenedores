// modules/guias/components/registrar-salida/registrar-salida-dialog.tsx

"use client"

import { FormProvider } from "react-hook-form"
import { LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

import type { GuiaConRelaciones } from "../guia-con-relaciones.type"
import { useRegistrarSalidaForm } from "./use-registrar-salida-form"
import { useCalcularMonto } from "./use-calcular-monto"
import { SeccionTransportista } from "./seccion-transportista"
import { SeccionFechaHora } from "./seccion-fecha-hora"
import { SeccionAlmacenamiento } from "./seccion-almacenamiento"
import { SeccionEspacioAlquilado } from "./seccion-espacio-alquilado"
import { SeccionIGV } from "./seccion-igv"
import { CalculoPreview } from "./calculo-preview"

type RegistrarSalidaDialogProps = {
  guia: GuiaConRelaciones
  open: boolean
  onOpenChange: (open: boolean) => void
  onRegistrada?: () => void
}

/**
 * Dialog para registrar la salida de un contenedor.
 *
 * Actúa como orquestador: delega la lógica al hook `useRegistrarSalidaForm`
 * y el cálculo a `useCalcularMonto`. Los subcomponentes de sección
 * leen/escriben el formulario a través del contexto de FormProvider.
 */
export function RegistrarSalidaDialog({
  guia,
  open,
  onOpenChange,
  onRegistrada,
}: RegistrarSalidaDialogProps) {
  const {
    form,
    submitting,
    setDiasEditados,
    precioBase,
    tipoPrecio,
    copiarDatosIngreso,
    handleTipoPrecioChange,
    onSubmit,
  } = useRegistrarSalidaForm({ guia, open, onOpenChange, onRegistrada })

  // Observamos los valores necesarios para el cálculo y el preview.
  const diasAlmacenamiento = form.watch("diasAlmacenamiento")
  const precioPrimerDia = form.watch("precioPrimerDia")
  const precioDiaAdicional = form.watch("precioDiaAdicional")
  const cantidadMovimientos = form.watch("cantidadMovimientos")
  const precioIngresoSalida = form.watch("precioIngresoSalida")
  const tratamientoIGV = form.watch("tratamientoIGV")

  // Los REEFER tienen un precio fijo de primer día de S/ 40.
  const precioPrimerDiaEstandar =
    guia.contenedor.tipo === "REEFER" ? 40 : precioBase?.precioPrimerDia

  const calculo = useCalcularMonto({
    tipoPrecio,
    diasAlmacenamiento,
    precioPrimerDia,
    precioDiaAdicional,
    precioIngresoSalida,
    cantidadMovimientos,
    tratamientoIGV,
    precioPrimerDiaEstandar,
    precioBase,
    porcentajeIGVGuia: guia.porcentajeIGV,
  })

  const tituloCalculo =
    tipoPrecio === "ESTANDAR"
      ? "Cálculo de almacenamiento"
      : tipoPrecio === "PERSONALIZADO"
        ? "Cálculo personalizado"
        : tipoPrecio === "ESPACIO_ALQUILADO"
          ? "Cálculo de espacio alquilado"
          : "Cálculo"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1rem)] max-w-4xl overflow-hidden p-0 sm:w-[calc(100%-2rem)] lg:max-w-5xl">
        <DialogHeader className="border-b px-4 py-4 sm:px-6">
          <DialogTitle>
            Registrar salida — Guía {guia.numeroGuia}
          </DialogTitle>

          <DialogDescription>
            Contenedor {guia.contenedor.numeroContenedor} ·{" "}
            {guia.cliente?.nombreCompleto ??
              guia.cliente?.numeroDocumento ??
              "Sin cliente"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] px-4 sm:px-6">
          <FormProvider {...form}>
            <form
              id="registrar-salida-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 py-4"
            >
              {/* TRANSPORTISTA */}
              <SeccionTransportista onCopiarDatosIngreso={copiarDatosIngreso} />

              <Separator />

              {/* FECHA Y HORA */}
              <SeccionFechaHora
                fechaIngreso={guia.fechaIngreso}
                horaIngreso={guia.horaIngreso}
              />

              <Separator />

              {/* ALMACENAMIENTO Y PRECIOS */}
              <SeccionAlmacenamiento
                onTipoPrecioChange={handleTipoPrecioChange}
                onDiasEditados={() => setDiasEditados(true)}
              />

              <Separator />

              {/* ESPACIO ALQUILADO (campos extra, solo visible para ese tipo) */}
              {tipoPrecio === "ESPACIO_ALQUILADO" && (
                <>
                  <SeccionEspacioAlquilado />
                  <Separator />
                </>
              )}

              {/* IGV */}
              <SeccionIGV />

              {/* PREVISUALIZACIÓN DEL CÁLCULO */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">{tituloCalculo}</h4>

                <CalculoPreview
                  tipoPrecio={tipoPrecio}
                  calculo={calculo}
                  diasAlmacenamiento={diasAlmacenamiento}
                  precioPrimerDia={precioPrimerDia}
                  precioDiaAdicional={precioDiaAdicional}
                  precioIngresoSalida={precioIngresoSalida}
                  cantidadMovimientos={cantidadMovimientos}
                  precioPrimerDiaEstandar={precioPrimerDiaEstandar}
                  precioBase={precioBase}
                />
              </div>
            </form>
          </FormProvider>
        </ScrollArea>

        {/* FOOTER */}
        <DialogFooter className="border-t px-4 py-4 sm:px-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            form="registrar-salida-form"
            disabled={submitting}
            className="w-full gap-2 sm:w-auto"
          >
            <LogOut className="size-4" />
            {submitting ? "Guardando..." : "Registrar salida"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
