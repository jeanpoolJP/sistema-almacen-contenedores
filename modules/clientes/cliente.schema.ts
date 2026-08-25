// modules/clientes/cliente.schema.ts

import { z } from "zod";

/**
 * Tipos de documento permitidos para identificar a un cliente.
 */
export const tipoDocumentoSchema = z.enum(["DNI", "RUC"], {
  message: "Selecciona un tipo de documento válido",
});

/**
 * Valida un DNI.
 */
const dniSchema = z
  .string()
  .trim()
  .length(8, "El DNI debe tener 8 dígitos")
  .regex(/^\d{8}$/, "El DNI debe contener únicamente números");

/**
 * Valida un RUC.
 */
const rucSchema = z
  .string()
  .trim()
  .length(11, "El RUC debe tener 11 dígitos")
  .regex(/^\d{11}$/, "El RUC debe contener únicamente números");

/**
 * Schema principal para crear y actualizar un cliente.
 */
export const clienteSchema = z
  .object({
    tipoDocumento: tipoDocumentoSchema,

    numeroDocumento: z
      .string()
      .trim()
      .min(1, "El número de documento es obligatorio"),

nombreCompleto: z
  .string()
  .trim()
  .min(
    3,
    "El nombre o razón social debe tener al menos 3 caracteres"
  )
  .max(
    150,
    "El nombre o razón social no puede superar los 150 caracteres"
  )
  .optional()
  .or(z.literal(""))
  .nullable(),

    telefono: z
      .string()
      .trim()
      .max(20, "El teléfono no puede superar los 20 caracteres")
      .optional()
      .or(z.literal("")),

    observaciones: z
      .string()
      .trim()
      .max(
        1000,
        "Las observaciones no pueden superar los 1000 caracteres",
      )
      .optional()
      .or(z.literal("")),

    activo: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.tipoDocumento === "DNI") {
      const result = dniSchema.safeParse(data.numeroDocumento);

      if (!result.success) {
        ctx.addIssue({
          code: "custom",
          path: ["numeroDocumento"],
          message: result.error.issues[0]?.message ?? "DNI inválido",
        });
      }
    }

    if (data.tipoDocumento === "RUC") {
      const result = rucSchema.safeParse(data.numeroDocumento);

      if (!result.success) {
        ctx.addIssue({
          code: "custom",
          path: ["numeroDocumento"],
          message: result.error.issues[0]?.message ?? "RUC inválido",
        });
      }
    }
  });

/**
 * Schema para buscar un cliente por su documento.
 *
 * Se utiliza principalmente desde el módulo de guías.
 */
export const clienteDocumentoSchema = z.object({
  tipoDocumento: tipoDocumentoSchema,

  numeroDocumento: z
    .string()
    .trim()
    .min(1, "El número de documento es obligatorio"),
});

/**
 * Schema para buscar un cliente únicamente por número de documento.
 *
 * Permite que el sistema determine si se trata de DNI o RUC
 * según la cantidad de dígitos.
 */
export const clienteBuscarDocumentoSchema = z.object({
  numeroDocumento: z
    .string()
    .trim()
    .refine(
      (value) => /^\d{8}$/.test(value) || /^\d{11}$/.test(value),
      "Ingresa un DNI de 8 dígitos o un RUC de 11 dígitos",
    ),
});