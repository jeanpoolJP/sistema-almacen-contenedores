import { z } from "zod";

export const clienteSchema = z.object({
  dni: z
    .string()
    .trim()
    .length(8, "El DNI debe tener 8 dígitos")
    .regex(/^\d{8}$/, "El DNI debe contener únicamente números"),

  nombreCompleto: z
    .string()
    .trim()
    .min(3, "El nombre completo debe tener al menos 3 caracteres")
    .max(150, "El nombre completo no puede superar los 150 caracteres"),

  telefono: z
    .string()
    .trim()
    .max(20, "El teléfono no puede superar los 20 caracteres")
    .optional()
    .or(z.literal("")),

  observaciones: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  activo: z.boolean().default(true),
});

export const clienteDniSchema = z.object({
  dni: z
    .string()
    .trim()
    .length(8, "El DNI debe tener 8 dígitos")
    .regex(/^\d{8}$/, "El DNI debe contener únicamente números"),
});