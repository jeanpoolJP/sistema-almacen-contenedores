import { EstadoEquipo, TipoEquipo } from "@/lib/generated/prisma/client"
import { z } from "zod"

const textoOpcional = (maximo: number) =>
  z
    .string()
    .trim()
    .max(maximo, `No puede superar ${maximo} caracteres`)
    .optional()
    .or(z.literal(""))
    .transform((valor) => valor || null)

const capacidadCargaSchema = z
  .string()
  .trim()
  .max(7, "La capacidad máxima es 9999.99 toneladas")
  .refine(
    (valor) => valor === "" || /^\d{1,4}(?:\.\d{1,2})?$/.test(valor),
    "Ingresa una capacidad con máximo dos decimales"
  )
  .refine(
    (valor) => valor === "" || Number(valor) > 0,
    "La capacidad debe ser mayor que cero"
  )
  .optional()
  .or(z.literal(""))
  .transform((valor) => valor || null)

const tiposEquipo = ["MONTACARGAS", "STACKER", "OTRO"] as const
const estadosEquipo = ["DISPONIBLE", "EN_REPARACION", "INOPERATIVO"] as const

export const equipoSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(1, "El código es obligatorio")
    .max(30, "El código no puede superar 30 caracteres")
    .regex(
      /^[A-Za-z0-9][A-Za-z0-9._/-]*$/,
      "Usa letras, números, puntos, guiones o barras"
    )
    .transform((valor) => valor.toUpperCase()),
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100),
  tipo: z.enum(TipoEquipo),
  marca: textoOpcional(60),
  modelo: textoOpcional(60),
  placa: textoOpcional(20).transform((valor) => valor?.toUpperCase() ?? null),
  capacidadCarga: capacidadCargaSchema,
  estado: z.enum(EstadoEquipo),
  observaciones: textoOpcional(1000),
})

export const filtrosEquiposSchema = z.object({
  busqueda: z.string().trim().max(100).default(""),
  tipo: z.enum(["todos", ...tiposEquipo]).default("todos"),
  estado: z.enum(["todos", ...estadosEquipo]).default("todos"),
  pagina: z.coerce.number().int().min(1).default(1),
  porPagina: z.coerce.number().int().min(1).max(100).default(10),
})

export type EquipoFormData = z.output<typeof equipoSchema>
export type FiltrosEquipos = z.input<typeof filtrosEquiposSchema>
