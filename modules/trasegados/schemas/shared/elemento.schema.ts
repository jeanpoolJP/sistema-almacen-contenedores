// modules\trasegados\schemas\shared\elemento.schema.ts

import { z } from "zod"
import { upperString, optionalUpperString } from "./upper-string.helper"
import { contenedorInputSchema } from "./contenedor.schema"
import { flatRackInputSchema } from "./flat-rack.schema"

/**
 * Elementos por tipo.
 */
const contenedorElementoSchema = z.object({
  tipo: z.literal("CONTENEDOR"),
  contenedor: contenedorInputSchema,
  observaciones: optionalUpperString(500),
})

const flatRackElementoSchema = z.object({
  tipo: z.literal("FLAT_RACK"),
  flatRack: flatRackInputSchema,
  observaciones: optionalUpperString(500),
})

const mercaderiaElementoSchema = z.object({
  tipo: z.literal("MERCADERIA"),
  numero: upperString(1, 50, "El número de la mercadería es obligatorio."),
  descripcion: upperString(
    1,
    255,
    "La descripción de la mercadería es obligatoria."
  ),
  observaciones: optionalUpperString(500),
})

const maquinariaElementoSchema = z.object({
  tipo: z.literal("MAQUINARIA"),
  numero: upperString(1, 50, "El número de la maquinaria es obligatorio."),
  descripcion: upperString(
    1,
    255,
    "La descripción de la maquinaria es obligatoria."
  ),
  observaciones: optionalUpperString(500),
})

export const elementoTrasegadoSchema = z.discriminatedUnion("tipo", [
  contenedorElementoSchema,
  flatRackElementoSchema,
  mercaderiaElementoSchema,
  maquinariaElementoSchema,
])

export type ElementoTrasegadoInput = z.infer<typeof elementoTrasegadoSchema>

