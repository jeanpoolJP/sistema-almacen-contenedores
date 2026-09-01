// modules\configuracion\components\configuracion-precios-form.tsx

"use client"

import { useEffect, useState } from "react"
import { Save } from "lucide-react"
import { toast } from "sonner"

import {
  actualizarConfiguracionPrecioAction,
  obtenerConfiguracionPrecioAction,
} from "../configuracion.actions"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ConfiguracionPreciosForm() {
  const [precioPrimerDia, setPrecioPrimerDia] = useState("")
  const [precioDiaAdicional, setPrecioDiaAdicional] = useState("")
  const [porcentajeIGV, setPorcentajeIGV] = useState("")

  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    async function cargarConfiguracion() {
      try {
        const result = await obtenerConfiguracionPrecioAction()

        if (!result.success || !result.data) {
          toast.error(result.message)
          return
        }

        setPrecioPrimerDia(String(result.data.precioPrimerDia))

        setPrecioDiaAdicional(String(result.data.precioDiaAdicional))

        setPorcentajeIGV(String(result.data.porcentajeIGV))
      } catch (error) {
        console.error(error)

        toast.error("No se pudo cargar la configuración")
      } finally {
        setLoading(false)
      }
    }

    cargarConfiguracion()
  }, [])

  function validarFormulario() {
    const primerDia = Number(precioPrimerDia)
    const adicional = Number(precioDiaAdicional)
    const igv = Number(porcentajeIGV)

    if (!precioPrimerDia || !Number.isFinite(primerDia)) {
      toast.error("Ingrese un precio válido para el primer día")
      return false
    }

    if (primerDia <= 0) {
      toast.error("El precio del primer día debe ser mayor a 0")
      return false
    }

    if (!precioDiaAdicional || !Number.isFinite(adicional)) {
      toast.error("Ingrese un precio válido para días adicionales")
      return false
    }

    if (adicional < 0) {
      toast.error("El precio del día adicional no puede ser negativo")
      return false
    }

    if (!porcentajeIGV || !Number.isFinite(igv)) {
      toast.error("Ingrese un porcentaje de IGV válido")
      return false
    }

    if (igv < 0 || igv > 100) {
      toast.error("El IGV debe estar entre 0% y 100%")
      return false
    }

    return true
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!validarFormulario()) {
      return
    }

    setGuardando(true)

    try {
      const result = await actualizarConfiguracionPrecioAction({
        precioPrimerDia: Number(precioPrimerDia),
        precioDiaAdicional: Number(precioDiaAdicional),
        porcentajeIGV: Number(porcentajeIGV),
      })

      if (!result.success) {
        toast.error(result.message)
        return
      }

      toast.success(result.message)
    } catch (error) {
      console.error(error)

      toast.error("No se pudo actualizar la configuración")
    } finally {
      setGuardando(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg border p-6">
        <p className="text-sm text-muted-foreground">
          Cargando configuración...
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* PRECIO PRIMER DÍA */}

      <div className="space-y-2">
        <Label htmlFor="precioPrimerDia">Precio del primer día</Label>

        <div className="relative">
          <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
            S/
          </span>

          <Input
            id="precioPrimerDia"
            name="precioPrimerDia"
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            value={precioPrimerDia}
            onChange={(event) => setPrecioPrimerDia(event.target.value)}
            className="pl-9"
            disabled={guardando}
          />
        </div>

        <p className="text-sm text-muted-foreground">
          Precio base que se cobra por el primer día de internamiento.
        </p>
      </div>

      {/* PRECIO DÍA ADICIONAL */}

      <div className="space-y-2">
        <Label htmlFor="precioDiaAdicional">Precio por día adicional</Label>

        <div className="relative">
          <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
            S/
          </span>

          <Input
            id="precioDiaAdicional"
            name="precioDiaAdicional"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={precioDiaAdicional}
            onChange={(event) => setPrecioDiaAdicional(event.target.value)}
            className="pl-9"
            disabled={guardando}
          />
        </div>

        <p className="text-sm text-muted-foreground">
          Precio que se cobra por cada día adicional de almacenamiento.
        </p>
      </div>

      {/* IGV */}

      <div className="space-y-2">
        <Label htmlFor="porcentajeIGV">Porcentaje de IGV</Label>

        <div className="relative">
          <Input
            id="porcentajeIGV"
            name="porcentajeIGV"
            type="number"
            min="0"
            max="100"
            step="0.01"
            inputMode="decimal"
            value={porcentajeIGV}
            onChange={(event) => setPorcentajeIGV(event.target.value)}
            className="pr-10"
            disabled={guardando}
          />

          <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
            %
          </span>
        </div>

        <p className="text-sm text-muted-foreground">
          Porcentaje utilizado automáticamente cuando una guía requiere IGV.
        </p>
      </div>

      {/* AVISO */}

      <div className="rounded-lg border bg-muted/50 p-4">
        <p className="text-sm font-medium">Configuración general del sistema</p>

        <p className="mt-1 text-sm text-muted-foreground">
          Estos valores serán utilizados automáticamente en las nuevas guías de
          internamiento. Los precios especiales de clientes particulares se
          podrán establecer directamente en cada guía.
        </p>
      </div>

      {/* BOTÓN */}

      <div className="flex justify-end">
        <Button type="submit" disabled={guardando}>
          <Save className="mr-2 size-4" />

          {guardando ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  )
}
