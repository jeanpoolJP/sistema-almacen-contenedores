// modules\inventario\inventario.schema.ts

import { z } from "zod"

export const crearInventarioSchema = z.object({
  fecha: z.coerce.date({
    message: "La fecha es obligatoria",
  }),

  observaciones: z
    .string()
    .max(500, "Las observaciones no pueden superar los 500 caracteres")
    .optional(),
})

export const actualizarResultadoInventarioSchema = z.object({
  detalleId: z.number().int().positive(),

  resultado: z.enum(["PENDIENTE", "ENCONTRADO", "NO_ENCONTRADO"]),

  observaciones: z
    .string()
    .max(500, "Las observaciones no pueden superar los 500 caracteres")
    .optional(),
})

export const inventarioIdSchema = z.object({
  id: z.number().int().positive(),
})

export type CrearInventarioSchema = z.infer<typeof crearInventarioSchema>

export type ActualizarResultadoInventarioSchema = z.infer<
  typeof actualizarResultadoInventarioSchema
>
