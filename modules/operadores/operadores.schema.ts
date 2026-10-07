import { TipoDocumentoPersona } from "@/lib/generated/prisma/client"
import { z } from "zod"

export const operadorSchema = z.object({
  tipoDocumento: z.enum(TipoDocumentoPersona),
  numeroDocumento: z
    .string()
    .trim()
    .min(3, "Ingresa un número de documento válido")
    .max(30, "El documento no puede superar los 30 caracteres")
    .regex(/^[A-Za-z0-9.-]+$/, "Usa solo letras, números, puntos o guiones")
    .transform((value) => value.toUpperCase()),
  nombres: z.string().trim().min(2, "Ingresa los nombres").max(100),
  apellidos: z.string().trim().min(2, "Ingresa los apellidos").max(100),
  telefono: z
    .string()
    .trim()
    .max(20, "El teléfono no puede superar 20 caracteres")
    .optional()
    .or(z.literal("")),
  licencia: z
    .string()
    .trim()
    .max(30, "La licencia no puede superar 30 caracteres")
    .optional()
    .or(z.literal("")),
  observaciones: z
    .string()
    .trim()
    .max(1000, "Las observaciones no pueden superar 1000 caracteres")
    .optional()
    .or(z.literal("")),
})

export const filtroOperadoresSchema = z.object({
  busqueda: z.string().trim().max(100).default(""),
  estado: z.enum(["todos", "activos", "inactivos"]).default("todos"),
  pagina: z.coerce.number().int().min(1).default(1),
  porPagina: z.coerce.number().int().min(1).max(100).default(10),
})

export type OperadorFormData = z.input<typeof operadorSchema>
export type OperadorFormValidated = z.output<typeof operadorSchema>
export type FiltroOperadores = z.input<typeof filtroOperadoresSchema>
