// modules/guias/components/registrar-salida/seccion-fecha-hora.tsx

"use client"

import { FechaIngresoDisplay } from "./fecha-ingreso-display"
import { FechaHoraField } from "../fields/fecha-hora-field"

type SeccionFechaHoraProps = {
  fechaIngreso: Date
  horaIngreso: Date
}

/**
 * Sección de fecha y hora del formulario de salida.
 *
 * Muestra la fecha/hora de ingreso (readonly) para referencia
 * y expone los campos de fecha/hora de salida para edición.
 */
export function SeccionFechaHora({
  fechaIngreso,
  horaIngreso,
}: SeccionFechaHoraProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Fecha y hora</h3>

        <p className="text-xs text-muted-foreground">
          Consulta la fecha de ingreso y registra la fecha y hora de salida.
        </p>
      </div>

      {/* Fecha/hora de ingreso en modo lectura */}
      <FechaIngresoDisplay
        fechaIngreso={fechaIngreso}
        horaIngreso={horaIngreso}
      />

      {/* Fecha/hora de salida editable */}
      <FechaHoraField
        fechaName="fechaSalida"
        horaName="horaSalida"
        label="Fecha y hora de salida"
      />
    </div>
  )
}
