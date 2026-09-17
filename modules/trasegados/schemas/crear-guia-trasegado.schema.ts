// modules\trasegados\schemas\crear-guia-trasegado.schema.ts

import { z } from "zod"

/**
 * Helpers para transformar strings a mayúsculas manteniendo las validaciones de longitud.
 */
const upperString = (min = 1, max = 255, msg = "Campo obligatorio") =>
  z
    .string()
    .trim()
    .min(min, msg)
    .max(max, `No puede superar los ${max} caracteres.`)
    .transform((v) => v.toUpperCase())

const optionalUpperString = (max = 255) =>
  z
    .string()
    .trim()
    .max(max, `No puede superar los ${max} caracteres.`)
    .transform((v) => (v ? v.toUpperCase() : v))
    .optional()
    .or(z.literal(""))

/**
 * Datos de una empresa de transporte.
 */
const empresaTransporteInputSchema = z.object({
  ruc: upperString(1, 20, "El RUC es obligatorio."),
  nombre: upperString(1, 255, "El nombre de la empresa es obligatorio."),
  telefono: optionalUpperString(30),
  contactoLogistico: optionalUpperString(255),
  nombreEncargado: optionalUpperString(255),
})

/**
 * Datos del vehículo.
 */
const vehiculoInputSchema = z.object({
  placa: upperString(1, 20, "La placa es obligatoria."),
  tipo: z
    .enum(["PORTA_CONTENEDORES", "CAMA_BAJA", "OTRO"])
    .optional()
    .nullable(),
  descripcion: optionalUpperString(255),
})

/**
 * Datos del conductor.
 */
const conductorInputSchema = z.object({
  numeroLicencia: upperString(1, 50, "El número de licencia es obligatorio."),
  nombreCompleto: upperString(
    1,
    255,
    "El nombre del conductor es obligatorio."
  ),
  telefono: optionalUpperString(30),
})

/**
 * Datos del contenedor.
 */
const contenedorInputSchema = z.object({
  numeroContenedor: upperString(
    1,
    20,
    "El número de contenedor es obligatorio."
  ),
  marca: upperString(1, 100, "La marca del contenedor es obligatoria."),
  medida: z.number().int().positive("La medida debe ser un número positivo."),
  tipo: z.enum(["NORMAL", "REEFER"]),
})

/**
 * Datos del flat rack.
 */
const flatRackInputSchema = z.object({
  numero: upperString(1, 20, "El número del flat rack es obligatorio."),
  marca: optionalUpperString(100),
})

/**
 * Elementos por tipo.
 */
const contenedorElementoSchema = z.object({
  tipo: z.literal("CONTENEDOR"),
  contenedor: contenedorInputSchema,
  observaciones: optionalUpperString(500),
})

const flatRackElementoSchema = z.object({
  tipo: z.literal("FLAT_RACK"),
  flatRack: flatRackInputSchema,
  observaciones: optionalUpperString(500),
})

const mercaderiaElementoSchema = z.object({
  tipo: z.literal("MERCADERIA"),
  numero: upperString(1, 50, "El número de la mercadería es obligatorio."),
  descripcion: upperString(
    1,
    255,
    "La descripción de la mercadería es obligatoria."
  ),
  observaciones: optionalUpperString(500),
})

const maquinariaElementoSchema = z.object({
  tipo: z.literal("MAQUINARIA"),
  numero: upperString(1, 50, "El número de la maquinaria es obligatorio."),
  descripcion: upperString(
    1,
    255,
    "La descripción de la maquinaria es obligatoria."
  ),
  observaciones: optionalUpperString(500),
})

export const elementoTrasegadoSchema = z.discriminatedUnion("tipo", [
  contenedorElementoSchema,
  flatRackElementoSchema,
  mercaderiaElementoSchema,
  maquinariaElementoSchema,
])

/**
 * Schema principal.
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
export type ElementoTrasegadoInput = z.infer<typeof elementoTrasegadoSchema>
