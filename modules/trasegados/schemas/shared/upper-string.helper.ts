// modules\trasegados\schemas\shared\upper-string.helper.ts

import { z } from "zod"

/**
 * Helpers para transformar strings a mayúsculas manteniendo las validaciones de longitud.
 */
export const upperString = (min = 1, max = 255, msg = "Campo obligatorio") =>
  z
    .string()
    .trim()
    .min(min, msg)
    .max(max, `No puede superar los ${max} caracteres.`)
    .transform((v) => v.toUpperCase())

export const optionalUpperString = (max = 255) =>
  z
    .string()
    .trim()
    .max(max, `No puede superar los ${max} caracteres.`)
    .transform((v) => (v ? v.toUpperCase() : v))
    .optional()
    .or(z.literal(""))