// modules\trasegados\schemas\crear-guia-trasegado.schema.ts

import { z } from "zod"
import { optionalUpperString } from "./shared/upper-string.helper"
import { empresaTransporteInputSchema } from "./shared/empresa-transporte.schema"
import { vehiculoInputSchema } from "./shared/vehiculo.schema"
import { conductorInputSchema } from "./shared/conductor.schema"
import { elementoTrasegadoSchema } from "./shared/elemento.schema"

/**
 * Schema principal para crear una guía de trasegado.
 */
export const crearGuiaTrasegadoSchema = z.object({
  numeroGuia: z
    .string()
    .trim()
    .min(1, "El número de guía es obligatorio.")
    .regex(/^\d+$/, "Solo se permiten números.")
    .max(6, "No puede superar los 6 dígitos.")
    .transform((val) => val.padStart(6, "0")),
  descripcionServicio: optionalUpperString(255),
  clienteId: z.number().int().positive().optional().nullable(),
  fechaIngreso: z.date({
    error: "La fecha y hora de ingreso son obligatorias.",
  }),
  observaciones: optionalUpperString(500),
  ingreso: z.object({
    empresaTransporte: empresaTransporteInputSchema,
    vehiculo: vehiculoInputSchema,
    conductor: conductorInputSchema,
    elementos: z
      .array(elementoTrasegadoSchema)
      .min(1, "Debe registrar al menos un elemento."),
  }),
})

export type CrearGuiaTrasegadoInput = z.infer<typeof crearGuiaTrasegadoSchema>

// Re-export para compatibilidad con imports existentes
export type { ElementoTrasegadoInput } from "./shared/elemento.schema"