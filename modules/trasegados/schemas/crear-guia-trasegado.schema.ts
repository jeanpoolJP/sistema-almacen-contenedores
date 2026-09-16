import { z } from "zod"

/**
 * Schema para un elemento que ingresa con la guía de trasegado.
 *
 * Reglas de campos:
 *
 * CONTENEDOR:
 * - contenedorId obligatorio
 *
 * FLAT_RACK:
 * - flatRackId obligatorio
 *
 * MERCADERIA:
 * - descripcion obligatoria
 *
 * MAQUINARIA:
 * - descripcion obligatoria
 * - numero opcional
 *
 * OTRO:
 * - descripcion obligatoria
 */
const elementoIngresoSchema = z
  .object({
    tipo: z.enum([
      "CONTENEDOR",
      "FLAT_RACK",
      "MERCADERIA",
      "MAQUINARIA",
      "OTRO",
    ]),

    contenedorId: z.number().int().positive().nullable().optional(),

    flatRackId: z.number().int().positive().nullable().optional(),

    descripcion: z
      .string()
      .trim()
      .max(255, "La descripción no puede superar los 255 caracteres.")
      .nullable()
      .optional(),

    numero: z
      .string()
      .trim()
      .max(50, "El número no puede superar los 50 caracteres.")
      .nullable()
      .optional(),

    observaciones: z
      .string()
      .trim()
      .max(5000, "Las observaciones son demasiado largas.")
      .nullable()
      .optional(),
  })
  .superRefine((elemento, ctx) => {
    if (elemento.tipo === "CONTENEDOR" && !elemento.contenedorId) {
      ctx.addIssue({
        code: "custom",
        path: ["contenedorId"],
        message: "Debe seleccionar un contenedor.",
      })
    }

    if (elemento.tipo === "FLAT_RACK" && !elemento.flatRackId) {
      ctx.addIssue({
        code: "custom",
        path: ["flatRackId"],
        message: "Debe seleccionar un flat rack.",
      })
    }

    if (
      ["MERCADERIA", "MAQUINARIA", "OTRO"].includes(elemento.tipo) &&
      !elemento.descripcion?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["descripcion"],
        message: "La descripción es obligatoria.",
      })
    }
  })

/**
 * Schema para crear una guía de trasegado junto con su ingreso.
 */
export const crearGuiaTrasegadoSchema = z.object({
  numeroGuia: z
    .string()
    .trim()
    .min(1, "El número de guía es obligatorio.")
    .max(30, "El número de guía no puede superar los 30 caracteres."),

  descripcionServicio: z
    .string()
    .trim()
    .max(255, "La descripción no puede superar los 255 caracteres.")
    .nullable()
    .optional(),

  fechaIngreso: z
    .string()
    .min(1, "La fecha de ingreso es obligatoria."),

  horaIngreso: z
    .string()
    .min(1, "La hora de ingreso es obligatoria."),

  empresaTransporteId: z
    .number()
    .int()
    .positive("Debe seleccionar una empresa de transporte."),

  vehiculoId: z
    .number()
    .int()
    .positive("Debe seleccionar un vehículo."),

  conductorId: z
    .number()
    .int()
    .positive("Debe seleccionar un conductor."),

  clienteId: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),

  elementos: z
    .array(elementoIngresoSchema)
    .min(1, "Debe registrar al menos un elemento de ingreso."),

  tratamientoIGV: z.enum(["SIN_IGV", "CON_IGV"]).default("SIN_IGV"),

  observaciones: z
    .string()
    .trim()
    .max(5000, "Las observaciones son demasiado largas.")
    .nullable()
    .optional(),
})

export type CrearGuiaTrasegadoInput = z.infer<
  typeof crearGuiaTrasegadoSchema
>

export type ElementoIngresoTrasegadoInput = z.infer<
  typeof elementoIngresoSchema
>
