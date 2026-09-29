// lib/date/format.ts
import { formatInTimeZone } from "date-fns-tz"
import { APP_TIMEZONE } from "./constants"

function isUtcMidnight(d: Date): boolean {
  return (
    d.getUTCHours() === 0 &&
    d.getUTCMinutes() === 0 &&
    d.getUTCSeconds() === 0 &&
    d.getUTCMilliseconds() === 0
  )
}

/**
 * Formatea una fecha al estilo dd/MM/yyyy.
 *
 * - Columnas `date` de Prisma (medianoche UTC) → se formatean en UTC.
 * - Timestamps reales → se formatean en `APP_TIMEZONE` (America/Lima).
 *
 * @param date   Fecha a formatear. Puede ser null/undefined.
 * @param fallback Texto a devolver cuando `date` es null/undefined. Default: "-".
 */
export function formatDate(
  date: Date | null | undefined,
  fallback = "-",
): string {
  if (!date) return fallback
  if (isUtcMidnight(date)) {
    return formatInTimeZone(date, "UTC", "dd/MM/yyyy")
  }
  return formatInTimeZone(date, APP_TIMEZONE, "dd/MM/yyyy")
}

/**
 * Formatea una fecha mostrando día, mes, año, hora y minutos
 * utilizando la zona horaria de Lima.
 *
 * @param date Fecha proveniente normalmente de Prisma/PostgreSQL.
 *
 * @returns Fecha y hora en formato DD/MM/YYYY HH:mm.
 *
 * @example
 * formatDateTime(guia.fechaIngreso)
 * // "15/09/2026 08:30"
 */
export function formatDateTime(date: Date): string {
  return formatInTimeZone(date, APP_TIMEZONE, "dd/MM/yyyy HH:mm")
}

/**
 * Formatea una fecha mostrando únicamente la hora de Lima.
 *
 * @param date Fecha proveniente normalmente de Prisma/PostgreSQL.
 *
 * @returns Hora en formato HH:mm.
 *
 * @example
 * formatTime(guia.fechaIngreso)
 * // "08:30"
 */
export function formatTime(date: Date): string {
  return formatInTimeZone(date, APP_TIMEZONE, "HH:mm")
}

/**
 * Devuelve la fecha de Lima en formato YYYY-MM-DD
 * ideal para `<input type="date">`.
 */
export function formatDateInput(date: Date): string {
  return formatInTimeZone(date, APP_TIMEZONE, "yyyy-MM-dd")
}

/**
 * Devuelve la hora de Lima en formato HH:mm
 * ideal para `<input type="time">`.
 */
export function formatTimeInput(date: Date): string {
  return formatInTimeZone(date, APP_TIMEZONE, "HH:mm")
}
