import { z } from "zod"

import { clienteSchema } from "@/modules/clientes/cliente.schema"

const fechaSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Ingresa una fecha válida.")
  .refine((fecha) => {
    const parsed = new Date(`${fecha}T00:00:00.000Z`)
    return (
      !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === fecha
    )
  }, "Ingresa una fecha válida.")

const horaSchema = z.union([
  z.literal(""),
  z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Ingresa una hora válida."),
])

export const guiaAlquilerSchema = z
  .object({
    numeroGuia: z
      .string()
      .trim()
      .min(1, "El número de guía es obligatorio.")
      .regex(/^\d{1,6}$/, "El número de guía debe tener entre 1 y 6 dígitos."),
    fechaInicio: fechaSchema,
    fechaFin: fechaSchema,
    solicitante: z
      .string()
      .trim()
      .max(150, "El solicitante no puede superar 150 caracteres.")
      .optional()
      .or(z.literal("")),
    horaSalida: horaSchema,
    horaInicio: horaSchema,
    horaFinalizacion: horaSchema,
    horaRetorno: horaSchema,
    equipoId: z.string().trim().min(1, "Selecciona un equipo."),
    operadorId: z.string().trim().min(1, "Selecciona un operador."),
    estado: z
      .enum(["EN_PROCESO", "FINALIZADO", "ANULADO"])
      .default("EN_PROCESO"),
    observaciones: z
      .string()
      .trim()
      .max(1000, "Las observaciones no pueden superar 1000 caracteres.")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((datos, ctx) => {
    if (datos.fechaFin < datos.fechaInicio) {
      ctx.addIssue({
        code: "custom",
        path: ["fechaFin"],
        message: "La fecha de fin no puede ser anterior al inicio.",
      })
    }
  })

export const actualizarGuiaAlquilerSchema = guiaAlquilerSchema.extend({
  id: z.string().trim().min(1, "El identificador de la guía es obligatorio."),
})

const clienteAlquilerSchema = clienteSchema.superRefine((cliente, ctx) => {
  if (!cliente.nombreCompleto?.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["nombreCompleto"],
      message: "El nombre o razón social es obligatorio.",
    })
  }
})

export const asignarClienteAlquilerSchema = z
  .object({
    guiaAlquilerId: z.string().trim().min(1),
    clienteId: z.number().int().positive().optional(),
    clienteData: clienteAlquilerSchema.optional(),
  })
  .refine((datos) => datos.clienteId || datos.clienteData, {
    message: "Selecciona un cliente o ingresa sus datos.",
  })

export const cotizacionAlquilerSchema = z.object({
  guiaAlquilerId: z.string().trim().min(1),
  numeroCotizacion: z
    .string()
    .trim()
    .min(1, "El número de cotización es obligatorio.")
    .max(50, "El número de cotización no puede superar 50 caracteres."),
  montoIngresado: z
    .number({ error: "Ingresa el monto cotizado." })
    .positive("El monto debe ser mayor a cero.")
    .max(9_999_999.99, "El monto excede el límite permitido."),
  modoIGVCotizacion: z.enum(["SIN_IGV", "CON_IGV", "IGV_INCLUIDO"]),
})

export const pagoAlquilerSchema = z
  .object({
    guiaAlquilerId: z.string().trim().min(1),
    metodoPago: z.enum([
      "EFECTIVO",
      "YAPE",
      "PLIN",
      "TRANSFERENCIA",
      "TARJETA",
      "OTRO",
    ]),
    numeroOperacion: z
      .string()
      .trim()
      .max(100, "El número de operación no puede superar 100 caracteres.")
      .optional()
      .or(z.literal("")),
    fechaPago: fechaSchema,
    horaPago: horaSchema.refine((hora) => hora !== "", {
      message: "La hora de pago es obligatoria.",
    }),
  })
  .superRefine((datos, ctx) => {
    if (datos.metodoPago !== "EFECTIVO" && !datos.numeroOperacion?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["numeroOperacion"],
        message:
          "El número de operación es obligatorio para pagos no efectivos.",
      })
    }
  })

export const listadoGuiasAlquilerSchema = z.object({
  pagina: z.number().int().positive().default(1),
  limite: z.number().int().min(1).max(100).default(20),
  busqueda: z.string().trim().max(100).default(""),
})

export type GuiaAlquilerInput = z.infer<typeof guiaAlquilerSchema>
export type GuiaAlquilerFormInput = z.input<typeof guiaAlquilerSchema>
export type ActualizarGuiaAlquilerInput = z.infer<
  typeof actualizarGuiaAlquilerSchema
>
export type AsignarClienteAlquilerInput = z.infer<
  typeof asignarClienteAlquilerSchema
>
export type CotizacionAlquilerInput = z.infer<typeof cotizacionAlquilerSchema>
export type PagoAlquilerInput = z.infer<typeof pagoAlquilerSchema>
export type ListadoGuiasAlquilerInput = z.input<
  typeof listadoGuiasAlquilerSchema
>
