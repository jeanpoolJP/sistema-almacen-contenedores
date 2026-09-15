// lib\date\create.ts

import { fromZonedTime } from "date-fns-tz"

import { APP_TIMEZONE } from "./constants"

/**
 * Crea un objeto Date a partir de una fecha y hora interpretadas
 * como hora local de Lima, Perú.
 *
 * La función convierte la fecha/hora proporcionada en Lima al
 * instante absoluto correspondiente en UTC.
 *
 * Esto es lo que debes utilizar antes de guardar una fecha/hora
 * introducida por el usuario en un campo PostgreSQL `timestamptz`.
 *
 * @param date Fecha en formato YYYY-MM-DD.
 * @param time Hora en formato HH:mm o HH:mm:ss.
 *
 * @returns Un objeto Date representando el instante absoluto.
 *
 * @example
 * const fechaIngreso = createLimaDate("2026-09-15", "08:30")
 *
 * await prisma.ingresoTrasegado.create({
 *   data: {
 *     fechaIngreso,
 *   },
 * })
 */
export function createLimaDate(date: string, time: string): Date {
  if (!date) {
    throw new Error("La fecha es obligatoria.")
  }

  if (!time) {
    throw new Error("La hora es obligatoria.")
  }

  const dateTime = `${date} ${time}`

  return fromZonedTime(dateTime, APP_TIMEZONE)
}

/**
 * Obtiene el instante actual.
 *
 * No es necesario convertir este valor a Lima antes de guardarlo.
 * `Date` representa un instante absoluto y PostgreSQL lo almacenará
 * correctamente en una columna `timestamptz`.
 *
 * @returns El instante actual.
 */
export function createNow(): Date {
  return new Date()
}