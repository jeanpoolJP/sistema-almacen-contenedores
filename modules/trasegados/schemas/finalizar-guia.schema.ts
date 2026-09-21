// modules\trasegados\schemas\finalizar-guia.schema.ts

import { z } from "zod"

/**
 * Schema para finalizar o reactivar una guía de trasegado.
 *
 * - `finalizar = true`  → marca la guía como FINALIZADO.
 * - `finalizar = false` → reactiva la guía a EN_PROCESO.
 */
export const cambiarEstadoGuiaSchema = z.object({
  guiaTrasegadoId: z.coerce
    .number()
    .int()
    .positive("El ID de la guía es obligatorio."),

  finalizar: z.boolean(),

  observaciones: z.string().trim().max(500).optional().or(z.literal("")),
})

export type CambiarEstadoGuiaInput = z.infer<typeof cambiarEstadoGuiaSchema>
