// modules\trasegados\schemas\registrar-salida.schema.ts

import { z } from "zod"

// ------------------------------------------------------------
// SUB-SCHEMAS DE TRANSPORTE (reutilizables con el ingreso)
// ------------------------------------------------------------

const empresaTransporteSalidaSchema = z.object({
  ruc: z.string().trim().min(1, "El RUC es obligatorio.").max(20),
  nombre: z.string().trim().min(1, "El nombre es obligatorio.").max(255),
  telefono: z.string().trim().max(30).optional().or(z.literal("")),
  contactoLogistico: z.string().trim().max(255).optional().or(z.literal("")),
  nombreEncargado: z.string().trim().max(255).optional().or(z.literal("")),
})

const vehiculoSalidaSchema = z.object({
  placa: z.string().trim().min(1, "La placa es obligatoria.").max(20),
  tipo: z
    .enum(["PORTA_CONTENEDORES", "CAMA_BAJA", "OTRO"])
    .optional()
    .nullable(),
  descripcion: z.string().trim().max(255).optional().or(z.literal("")),
})

const conductorSalidaSchema = z.object({
  numeroLicencia: z
    .string()
    .trim()
    .min(1, "La licencia es obligatoria.")
    .max(50),
  nombreCompleto: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(255),
  telefono: z.string().trim().max(30).optional().or(z.literal("")),
})

// ------------------------------------------------------------
// SCHEMA PRINCIPAL
// ------------------------------------------------------------

/**
 * Schema para registrar una salida de una guía de trasegado.
 *
 * Reglas:
 * - Debe haber al menos un elemento seleccionado.
 * - Los IDs de los elementos deben pertenecer al ingreso de la guía.
 * - Los elementos identificables (contenedor/flat rack) solo pueden
 *   salir una vez. El service lo valida contra la BD.
 */
export const registrarSalidaSchema = z.object({
  guiaTrasegadoId: z
    .number({ error: "El ID de la guía es obligatorio." })
    .int()
    .positive("El ID de la guía es obligatorio."),

  /**
   * Fecha y hora de salida.
   * El formulario lo construye con createLimaDate antes de enviarlo.
   */
  fechaSalida: z.date({
    error: "La fecha y hora de salida son obligatorias.",
  }),

  observaciones: z.string().trim().max(500).optional().or(z.literal("")),

  empresaTransporte: empresaTransporteSalidaSchema,
  vehiculo: vehiculoSalidaSchema,
  conductor: conductorSalidaSchema,

  /**
   * IDs de los GuiaTrasegadoElemento que se retiran en esta salida.
   * Debe tener al menos uno.
   */
  elementosIds: z
    .array(z.number().int().positive())
    .min(1, "Debe seleccionar al menos un elemento para retirar."),
})

export type RegistrarSalidaInput = z.infer<typeof registrarSalidaSchema>

export type EmpresaTransporteSalidaInput = z.infer<
  typeof empresaTransporteSalidaSchema
>
export type VehiculoSalidaInput = z.infer<typeof vehiculoSalidaSchema>
export type ConductorSalidaInput = z.infer<typeof conductorSalidaSchema>
