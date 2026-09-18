// modules\trasegados\schemas\shared\flat-rack.schema.ts

import { z } from "zod"
import { upperString, optionalUpperString } from "./upper-string.helper"

/**
 * Datos del flat rack.
 */
export const flatRackInputSchema = z.object({
  numero: upperString(1, 20, "El número del flat rack es obligatorio."),
  marca: optionalUpperString(100),
})

export type FlatRackInput = z.infer<typeof flatRackInputSchema>
