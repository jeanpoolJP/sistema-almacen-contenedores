// modules\flat-racks\flat-rack.schema.ts

import { z } from "zod"

/**
 * Normaliza un texto para almacenarlo en mayúsculas.
 *
 * - Elimina espacios al inicio y al final.
 * - Convierte todo el texto a mayúsculas.
 */
const uppercaseText = (value: string) => value.trim().toUpperCase()

/**
 * Schema para crear un Flat Rack.
 */
export const createFlatRackSchema = z.object({
  numero: z
    .string()
    .trim()
    .min(1, "EL NÚMERO DEL FLAT RACK ES OBLIGATORIO")
    .max(20, "EL NÚMERO DEL FLAT RACK NO PUEDE SUPERAR LOS 20 CARACTERES")
    .transform(uppercaseText),

  marca: z
    .string()
    .trim()
    .min(1, "LA MARCA ES OBLIGATORIA")
    .max(100, "LA MARCA NO PUEDE SUPERAR LOS 100 CARACTERES")
    .transform(uppercaseText),
})

/**
 * Schema para actualizar un Flat Rack.
 */
export const updateFlatRackSchema = z.object({
  id: z.number().int().positive("EL ID DEL FLAT RACK NO ES VÁLIDO"),

  numero: z
    .string()
    .trim()
    .min(1, "EL NÚMERO DEL FLAT RACK ES OBLIGATORIO")
    .max(20, "EL NÚMERO DEL FLAT RACK NO PUEDE SUPERAR LOS 20 CARACTERES")
    .transform(uppercaseText),

  marca: z
    .string()
    .trim()
    .min(1, "LA MARCA ES OBLIGATORIA")
    .max(100, "LA MARCA NO PUEDE SUPERAR LOS 100 CARACTERES")
    .transform(uppercaseText),
})

/**
 * Schema para buscar Flat Racks por número.
 *
 * La búsqueda también se normaliza a mayúsculas.
 */
export const searchFlatRackSchema = z.object({
  numero: z
    .string()
    .trim()
    .min(1, "EL NÚMERO DEL FLAT RACK ES OBLIGATORIO")
    .max(20, "EL NÚMERO DEL FLAT RACK NO PUEDE SUPERAR LOS 20 CARACTERES")
    .transform(uppercaseText),
})

/**
 * Schema para listar Flat Racks con paginacion.
 *
 * Permite realizar búsquedas opcionales por número o marca.
 */
export const flatRackListSchema = z.object({
  search: z
    .string()
    .trim()
    .max(100, "LA BÚSQUEDA NO PUEDE SUPERAR LOS 100 CARACTERES")
    .transform((value) => value.toUpperCase())
    .optional(),

  page: z.number().int().positive().default(1),

  pageSize: z.number().int().positive().max(100).default(10),
})

export type CreateFlatRackInput = z.infer<typeof createFlatRackSchema>

export type UpdateFlatRackInput = z.infer<typeof updateFlatRackSchema>

export type SearchFlatRackInput = z.infer<typeof searchFlatRackSchema>

export type FlatRackListInput = z.infer<typeof flatRackListSchema>

// Datos que realmente se actualizan
export type UpdateFlatRackData = Omit<UpdateFlatRackInput, "id">
