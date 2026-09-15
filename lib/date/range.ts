// lib\date\range.ts

import { addDays, startOfDay } from "date-fns"
import { fromZonedTime } from "date-fns-tz"

import { APP_TIMEZONE } from "./constants"

/**
 * Rango de instantes absolutos para realizar consultas
 * sobre columnas PostgreSQL `timestamptz`.
 */
export interface DateRange {
  from: Date
  to: Date
}

/**
 * Crea el rango correspondiente a un día calendario de Lima.
 *
 * El rango utiliza:
 *
 *   >= inicio del día
 *   < inicio del día siguiente
 *
 * Esto permite utilizar el resultado directamente en Prisma.
 *
 * @param date Fecha en formato YYYY-MM-DD.
 *
 * @example
 * const range = createDateRangeLima("2026-09-15")
 *
 * const guias = await prisma.guiaTrasegado.findMany({
 *   where: {
 *     fechaIngreso: {
 *       gte: range.from,
 *       lt: range.to,
 *     },
 *   },
 * })
 */
export function createDateRangeLima(date: string): DateRange {
  if (!date) {
    throw new Error("La fecha es obligatoria.")
  }

  const localDate = fromZonedTime(date, APP_TIMEZONE)

  const startOfDayLima = startOfDay(localDate)

  const startOfNextDayLima = addDays(startOfDayLima, 1)

  return {
    from: fromZonedTime(startOfDayLima, APP_TIMEZONE),
    to: fromZonedTime(startOfNextDayLima, APP_TIMEZONE),
  }
}
