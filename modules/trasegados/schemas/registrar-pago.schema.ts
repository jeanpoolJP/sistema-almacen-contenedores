// modules\trasegados\schemas\registrar-pago.schema.ts

import { z } from "zod"

/**
 * Métodos de pago soportados (deben coincidir con el enum MetodoPago).
 */
export const METODOS_PAGO = [
  "EFECTIVO",
  "YAPE",
  "PLIN",
  "TRANSFERENCIA",
  "TARJETA",
  "OTRO",
] as const

export type MetodoPagoValue = (typeof METODOS_PAGO)[number]

/**
 * Etiquetas legibles para la UI.
 */
export const ETIQUETAS_METODO_PAGO: Record<MetodoPagoValue, string> = {
  EFECTIVO: "Efectivo",
  YAPE: "Yape",
  PLIN: "Plin",
  TRANSFERENCIA: "Transferencia",
  TARJETA: "Tarjeta",
  OTRO: "Otro",
}

/**
 * Schema para registrar o actualizar el pago de una guía.
 *
 * Reglas:
 * - `numeroOperacion` es obligatorio si el método NO es EFECTIVO.
 * - `fechaPago` se construye en el form con createLimaDate.
 */
export const registrarPagoSchema = z
  .object({
    guiaTrasegadoId: z
      .number({ error: "El ID de la guía es obligatorio." })
      .int()
      .positive("El ID de la guía es obligatorio."),

    metodoPago: z.enum(METODOS_PAGO),

    numeroOperacion: z
      .string()
      .trim()
      .max(100, "El número de operación no puede superar los 100 caracteres.")
      .optional()
      .or(z.literal("")),

    fechaPago: z.date({
      error: "La fecha de pago es obligatoria.",
    }),

    observaciones: z
      .string()
      .trim()
      .max(500, "Las observaciones no pueden superar los 500 caracteres.")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    // numeroOperacion obligatorio para pagos no efectivos
    if (data.metodoPago !== "EFECTIVO" && !data.numeroOperacion?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["numeroOperacion"],
        message:
          "El número de operación es obligatorio para pagos no efectivos.",
      })
    }
  })

export type RegistrarPagoInput = z.infer<typeof registrarPagoSchema>
