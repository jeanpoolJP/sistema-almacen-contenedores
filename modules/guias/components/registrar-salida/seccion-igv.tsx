// modules/guias/components/registrar-salida/seccion-igv.tsx

"use client"

import { useFormContext } from "react-hook-form"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

import type { RegistrarSalidaGuiaSchema } from "../../guia.schema"

/**
 * Sección del switch de IGV.
 *
 * Cuando está activo (CON_IGV), el cálculo incluye el IGV en el monto total.
 * Cuando está inactivo (SIN_IGV), el monto no incluye IGV (boleta).
 */
export function SeccionIGV() {
  const form = useFormContext<RegistrarSalidaGuiaSchema>()
  const tratamientoIGV = form.watch("tratamientoIGV")

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-0.5">
        <Label>¿El cliente solicita factura (con IGV)?</Label>

        <p className="text-xs text-muted-foreground">
          Se recalculará el monto total con el IGV correspondiente.
        </p>
      </div>

      <Switch
        checked={tratamientoIGV === "CON_IGV"}
        onCheckedChange={(checked) =>
          form.setValue("tratamientoIGV", checked ? "CON_IGV" : "SIN_IGV")
        }
      />
    </div>
  )
}
