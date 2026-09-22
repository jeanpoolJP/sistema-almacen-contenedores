import { z } from "zod"

import { ingresoTrasegadoSchema } from "./crear-guia-trasegado.schema"

export const registrarIngresoSchema = z.object({
  guiaTrasegadoId: z.number().int().positive(),
  ingreso: ingresoTrasegadoSchema,
})

export type RegistrarIngresoInput = z.infer<typeof registrarIngresoSchema>
