// modules\trasegados\schemas\obtener-guia-trasegado.schema.ts

import { z } from "zod"

export const obtenerGuiaTrasegadoSchema = z.object({
  id: z.coerce.number().int().positive("El ID debe ser positivo."),
})

export type ObtenerGuiaTrasegadoInput = z.infer<
  typeof obtenerGuiaTrasegadoSchema
>
