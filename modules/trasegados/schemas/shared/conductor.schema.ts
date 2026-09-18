// modules\trasegados\schemas\shared\conductor.schema.ts

import { z } from "zod"
import { upperString, optionalUpperString } from "./upper-string.helper"

/**
 * Datos del conductor.
 */
export const conductorInputSchema = z.object({
  numeroLicencia: upperString(1, 50, "El número de licencia es obligatorio."),
  nombreCompleto: upperString(
    1,
    255,
    "El nombre del conductor es obligatorio."
  ),
  telefono: optionalUpperString(30),
})

export type ConductorInput = z.infer<typeof conductorInputSchema>
