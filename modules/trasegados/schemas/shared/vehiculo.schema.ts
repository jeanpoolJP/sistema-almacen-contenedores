// modules\trasegados\schemas\shared\vehiculo.schema.ts

import { z } from "zod"
import { upperString, optionalUpperString } from "./upper-string.helper"

/**
 * Datos del vehículo.
 */
export const vehiculoInputSchema = z.object({
  placa: upperString(1, 20, "La placa es obligatoria."),
  tipo: z
    .enum(["PORTA_CONTENEDORES", "CAMA_BAJA", "OTRO"])
    .optional()
    .nullable(),
  descripcion: optionalUpperString(255),
})

export type VehiculoInput = z.infer<typeof vehiculoInputSchema>
