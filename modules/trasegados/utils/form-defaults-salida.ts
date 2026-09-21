// modules\trasegados\utils\form-defaults-salida.ts

import { createLimaDate } from "@/lib/date/create"

/**
 * Construye la fecha de salida por defecto a partir de la fecha/hora
 * actual en Lima.
 *
 * Se expone acá por si en el futuro se quiere iniciar en otra hora.
 */
export function crearFechaSalidaDefault(): Date {
  const ahora = new Date()

  // Año, mes, día y hora actuales en Lima
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(ahora)

  const get = (t: string) => partes.find((p) => p.type === t)?.value ?? "00"

  const fecha = `${get("year")}-${get("month")}-${get("day")}`
  const hora = `${get("hour")}:${get("minute")}`

  return createLimaDate(fecha, hora)
}
