// modules\conductores\conductores.schema.ts

import { z } from "zod"

/**
 * Esquema principal para crear y editar conductores.
 */
export const conductorSchema = z.object({
  nombreCompleto: z
    .string()
    .trim()
    .min(3, "El nombre completo debe tener al menos 3 caracteres")
    .max(100, "El nombre completo no puede superar los 100 caracteres"),

  numeroLicencia: z
    .string()
    .trim()
    .min(5, "El número de licencia debe tener al menos 5 caracteres")
    .max(30, "El número de licencia no puede superar los 30 caracteres")
    .regex(
      /^[A-Za-z0-9-]+$/,
      "El número de licencia solo puede contener letras, números y guiones"
    ),

  telefono: z
    .string()
    .trim()
    .max(20, "El teléfono no puede superar los 20 caracteres")
    .optional()
    .or(z.literal("")),
})

/**
 * Esquema utilizado para buscar un conductor
 * mediante su número de licencia.
 *
 * Se utilizará principalmente al momento
 * de registrar una guía.
 */
export const conductorLicenciaSchema = z.object({
  numeroLicencia: z
    .string()
    .trim()
    .min(5, "El número de licencia no es válido")
    .max(30, "El número de licencia no puede superar los 30 caracteres")
    .regex(
      /^[A-Za-z0-9-]+$/,
      "El número de licencia solo puede contener letras, números y guiones"
    ),
})
