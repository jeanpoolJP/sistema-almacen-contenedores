// modules/guias/components/registrar-salida/seccion-transportista.tsx

"use client"

import { CopyPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TransportistaFields } from "../fields/transportista-fields"

type SeccionTransportistaProps = {
  /**
   * Callback que copia los datos del transportista de ingreso
   * al formulario de salida.
   */
  onCopiarDatosIngreso: () => void
}

/**
 * Sección del transportista que recoge el contenedor a la salida.
 *
 * Incluye el botón para copiar los datos del transportista de ingreso,
 * útil cuando el mismo camión recoge el contenedor.
 */
export function SeccionTransportista({
  onCopiarDatosIngreso,
}: SeccionTransportistaProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold">Transportista que recoge</p>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-fit gap-1.5 text-xs text-muted-foreground"
          onClick={onCopiarDatosIngreso}
        >
          <CopyPlus className="size-3.5" />
          Usar mismos datos de ingreso
        </Button>
      </div>

      <TransportistaFields prefix="transportistaSalida" />
    </div>
  )
}
