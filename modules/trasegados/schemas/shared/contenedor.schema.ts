// modules\trasegados\schemas\shared\contenedor.schema.ts

import { z } from "zod"
import { upperString } from "./upper-string.helper"

/**
 * Datos del contenedor.
 */
export const contenedorInputSchema = z.object({
  numeroContenedor: upperString(
    1,
    20,
    "El número de contenedor es obligatorio."
  ),
  marca: upperString(1, 100, "La marca del contenedor es obligatoria."),
  medida: z.number().int().positive("La medida debe ser un número positivo."),
  tipo: z.enum(["NORMAL", "REEFER"]),
})

export type ContenedorInput = z.infer<typeof contenedorInputSchema>
