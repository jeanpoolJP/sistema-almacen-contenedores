// modules\trasegados\schemas\asignar-cliente.schema.ts

import { z } from "zod"

/**
 * Schema para asignar (o crear) un cliente a una guía de trasegado.
 *
 * - Si el cliente existe por número de documento, el service lo reutiliza.
 * - Si no existe, se crea con los demás datos.
 * - Si `clienteId` viene informado, se ignora el resto y se asigna directo.
 */
export const asignarClienteSchema = z
  .object({
    guiaTrasegadoId: z.coerce
      .number()
      .int("El ID de la guía debe ser un entero.")
      .positive("El ID de la guía es obligatorio."),

    /**
     * Si viene, se asigna directamente sin buscar ni crear.
     * Lo usa la UI cuando el usuario ya encontró un cliente existente.
     */
    clienteId: z.number().int().positive().optional().nullable(),

    tipoDocumento: z.enum(["DNI", "RUC"]),

    numeroDocumento: z
      .string()
      .trim()
      .min(1, "El número de documento es obligatorio.")
      .max(11, "El número de documento no puede superar los 11 caracteres."),

    nombreCompleto: z
      .string()
      .trim()
      .max(150, "El nombre no puede superar los 150 caracteres.")
      .optional()
      .or(z.literal("")),

    telefono: z
      .string()
      .trim()
      .max(20, "El teléfono no puede superar los 20 caracteres.")
      .optional()
      .or(z.literal("")),

    observaciones: z.string().trim().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    // Si no hay clienteId, debe venir nombreCompleto para crearlo
    if (!data.clienteId && !data.nombreCompleto?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["nombreCompleto"],
        message:
          "El nombre completo es obligatorio para registrar un cliente nuevo.",
      })
    }
  })

export type AsignarClienteInput = z.infer<typeof asignarClienteSchema>
