// modules/guias/components/registrar-salida/utils.ts

/**
 * Formatea un número monetario en soles peruanos.
 *
 * Ejemplo: 1234.5 → "S/ 1234.50"
 */
export function formatearMonto(valor: number): string {
  return `S/ ${valor.toFixed(2)}`
}

/**
 * Convierte un valor numérico al tipo esperado por los inputs HTML.
 *
 * Retorna string vacío cuando el valor es undefined o NaN,
 * para que el input quede vacío en lugar de mostrar "NaN" o "undefined".
 */
export function valorParaInput(valor: number | undefined): number | string {
  return valor === undefined || Number.isNaN(valor) ? "" : valor
}

/**
 * Formatea la fecha de ingreso (UTC) como cadena legible.
 *
 * Usa UTC porque las fechas de ingreso se almacenan en UTC
 * para evitar ambigüedades de zona horaria.
 *
 * Ejemplo: 2026-08-25T00:00:00Z → "25 ago 2026"
 */
export function formatearFechaIngreso(fecha: Date | string): string {
  const fechaDate = typeof fecha === "string" ? new Date(fecha) : fecha

  const dia = String(fechaDate.getUTCDate()).padStart(2, "0")

  const meses = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ]

  const mes = meses[fechaDate.getUTCMonth()]
  const año = fechaDate.getUTCFullYear()

  return `${dia} ${mes} ${año}`
}

/**
 * Formatea la hora de ingreso (UTC) como cadena HH:mm.
 *
 * Las horas se almacenan como fechas neutras UTC (1970-01-01THH:mm:00Z)
 * por eso usamos getUTCHours/getUTCMinutes.
 */
export function formatearHoraIngreso(hora: Date | string): string {
  const horaDate = typeof hora === "string" ? new Date(hora) : hora

  const horas = String(horaDate.getUTCHours()).padStart(2, "0")
  const minutos = String(horaDate.getUTCMinutes()).padStart(2, "0")

  return `${horas}:${minutos}`
}

/**
 * Combina la fecha (UTC) y hora (UTC neutra) de ingreso
 * en un único Date UTC para comparación con la salida.
 *
 * Tanto la fecha como la hora de ingreso provienen del servidor
 * y se almacenan en UTC.
 */
export function combinarFechaHoraIngreso(fecha: Date, hora: Date): Date {
  return new Date(
    Date.UTC(
      fecha.getUTCFullYear(),
      fecha.getUTCMonth(),
      fecha.getUTCDate(),
      hora.getUTCHours(),
      hora.getUTCMinutes(),
      hora.getUTCSeconds(),
      0
    )
  )
}

/**
 * Combina la fecha (local) y hora (UTC neutra) de salida
 * en un único Date UTC para comparación con el ingreso.
 *
 * IMPORTANTE: La fecha de salida proviene del componente Calendar,
 * que crea fechas con componentes locales (getFullYear, getMonth, getDate).
 * La hora proviene del input de tiempo, almacenada como UTC neutra.
 * Por eso usamos fecha local + hora UTC al construir el resultado.
 */
export function combinarFechaHoraSalida(fecha: Date, hora: Date): Date {
  return new Date(
    Date.UTC(
      fecha.getFullYear(),
      fecha.getMonth(),
      fecha.getDate(),
      hora.getUTCHours(),
      hora.getUTCMinutes(),
      hora.getUTCSeconds(),
      0
    )
  )
}
