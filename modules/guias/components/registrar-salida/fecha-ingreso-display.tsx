// modules/guias/components/registrar-salida/fecha-ingreso-display.tsx

"use client"

import { CalendarIcon, Clock } from "lucide-react"

import { formatearFechaIngreso, formatearHoraIngreso } from "./utils"

type FechaIngresoDisplayProps = {
  fechaIngreso: Date
  horaIngreso: Date
}

/**
 * Muestra la fecha y hora de ingreso en modo solo lectura.
 *
 * Usa estilo visual similar a los inputs del formulario
 * para mantener coherencia en la cuadrícula.
 */
export function FechaIngresoDisplay({
  fechaIngreso,
  horaIngreso,
}: FechaIngresoDisplayProps) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">Fecha y hora de ingreso</span>

      <div className="grid grid-cols-2 gap-3">
        {/* FECHA */}
        <div className="flex h-10 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
          <CalendarIcon className="mr-2 size-4 shrink-0" />
          {formatearFechaIngreso(fechaIngreso)}
        </div>

        {/* HORA */}
        <div className="flex h-10 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
          <Clock className="mr-2 size-4 shrink-0" />
          {formatearHoraIngreso(horaIngreso)}
        </div>
      </div>
    </div>
  )
}
