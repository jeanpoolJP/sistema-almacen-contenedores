// modules\liquidaciones\liquidacion.schema.ts

import { z } from "zod"

export const estadoLiquidacionEnum = z.enum([
  "BORRADOR",
  "CONFIRMADA",
  "PAGADA",
  "ANULADA",
])

export const createLiquidacionSchema = z.object({
  clienteId: z.coerce.number().int().positive("Cliente requerido"),
  fechaCorte: z.coerce.date(),
  observaciones: z.string().max(1000).optional().nullable(),
})

export const updateLiquidacionDetallesSchema = z.object({
  liquidacionId: z.coerce.number().int().positive(),
  guiaIds: z
    .array(z.coerce.number().int().positive())
    .min(1, "Debe incluir al menos una guía"),
})

export const confirmarLiquidacionSchema = z.object({
  liquidacionId: z.coerce.number().int().positive(),
})

export const registrarPagoLiquidacionSchema = z.object({
  liquidacionId: z.coerce.number().int().positive(),
  metodoPago: z.enum([
    "EFECTIVO",
    "YAPE",
    "PLIN",
    "TRANSFERENCIA",
    "TARJETA",
    "OTRO",
  ]),
  numeroOperacion: z.string().min(1, "Número de operación requerido").max(100),
  fechaPago: z.coerce.date(),
  observaciones: z.string().max(1000).optional().nullable(),
})

export const listLiquidacionesSchema = z.object({
  clienteId: z.coerce.number().int().positive().optional(),
  estado: estadoLiquidacionEnum.optional(),
  desde: z.coerce.date().optional(),
  hasta: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export type CreateLiquidacionInput = z.infer<typeof createLiquidacionSchema>
export type UpdateLiquidacionDetallesInput = z.infer<
  typeof updateLiquidacionDetallesSchema
>
export type ConfirmarLiquidacionInput = z.infer<
  typeof confirmarLiquidacionSchema
>
export type RegistrarPagoLiquidacionInput = z.infer<
  typeof registrarPagoLiquidacionSchema
>
export type ListLiquidacionesInput = z.infer<typeof listLiquidacionesSchema>
