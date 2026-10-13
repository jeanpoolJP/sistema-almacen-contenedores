// modules/control-alquiler/control-alquiler.schema.ts
import { z } from "zod"

// ============================================================
// HELPERS
// ============================================================

const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

/** Acepta "HH:mm" o null/undefined/"" y devuelve string | null */
const horaOpcional = z
  .string()
  .trim()
  .regex(horaRegex, "Formato de hora inválido (HH:mm)")
  .optional()
  .nullable()
  .or(z.literal(""))
  .transform((v) => (v === "" || v == null ? null : v))

const decimalOpcional = z
  .union([z.number(), z.string()])
  .optional()
  .nullable()
  .transform((v) => {
    if (v === "" || v == null) return null
    const n = typeof v === "number" ? v : Number(v)
    return Number.isFinite(n) ? n : null
  })

const decimalRequerido = z
  .union([z.number(), z.string()])
  .transform((v) => (typeof v === "number" ? v : Number(v)))
  .refine((n) => Number.isFinite(n) && n >= 0, "Debe ser un número válido")

// ============================================================
// ENUMS (reflejan el schema.prisma)
// ============================================================

export const estadoGuiaAlquilerEnum = z.enum([
  "EN_PROCESO",
  "FINALIZADO",
  "ANULADO",
])

export const estadoPagoEnum = z.enum(["PENDIENTE", "PAGADO"])

export const metodoPagoEnum = z.enum([
  "EFECTIVO",
  "YAPE",
  "PLIN",
  "TRANSFERENCIA",
  "TARJETA",
  "OTRO",
])

export const modoIGVCotizacionEnum = z.enum([
  "SIN_IGV",
  "CON_IGV",
  "IGV_INCLUIDO",
])

// ============================================================
// GUÍA ALQUILER — FORM PRINCIPAL
// ============================================================

export const guiaAlquilerSchema = z
  .object({
    numeroGuia: z
      .string()
      .trim()
      .regex(/^\d+$/, "El número de guía solo puede contener números")
      .transform((valor) => {
        const numero = Number(valor)

        if (!Number.isFinite(numero) || numero < 0) {
          throw new Error("El número de guía no es válido")
        }

        if (numero > 999999) {
          throw new Error("El número de guía no puede tener más de 6 dígitos")
        }

        return numero.toString().padStart(6, "0")
      }),

    fechaInicio: z.coerce.date({
      message: "La fecha de inicio es requerida",
    }),
    fechaFin: z.coerce.date({
      message: "La fecha de fin es requerida",
    }),

    descripcionServicio: z
      .string()
      .trim()
      .max(255)
      .optional()
      .nullable()
      .or(z.literal(""))
      .transform((v) => (v === "" ? null : (v ?? null))),

    solicitante: z
      .string()
      .trim()
      .max(150)
      .optional()
      .nullable()
      .or(z.literal(""))
      .transform((v) => (v === "" ? null : (v ?? null))),

    lugarServicio: z
      .string()
      .trim()
      .max(250)
      .optional()
      .nullable()
      .or(z.literal(""))
      .transform((v) => (v === "" ? null : (v ?? null))),

    // Horarios
    horaSalida: horaOpcional,
    horaInicio: horaOpcional,
    horaFinalizacion: horaOpcional,
    horaRetorno: horaOpcional,

    // Condiciones de cobro
    horasMinimas: decimalOpcional.refine(
      (valor) => valor == null || valor >= 0,
      "Las horas mínimas no pueden ser negativas"
    ),
    precioPorHora: decimalOpcional.refine(
      (valor) => valor == null || valor >= 0,
      "El precio por hora no puede ser negativo"
    ),
    numeroCotizacion: z
      .string()
      .trim()
      .max(50, "El número de cotización no puede superar los 50 caracteres")
      .optional()
      .nullable()
      .or(z.literal(""))
      .transform((valor) => (valor === "" || valor == null ? null : valor)),
    modoIGVCotizacion: modoIGVCotizacionEnum.default("SIN_IGV"),

    // Horómetro
    horometroInicial: decimalOpcional,
    horometroFinal: decimalOpcional,

    observaciones: z
      .string()
      .trim()
      .optional()
      .nullable()
      .or(z.literal(""))
      .transform((v) => (v === "" ? null : (v ?? null))),

    estado: estadoGuiaAlquilerEnum.default("EN_PROCESO"),

    // Relaciones
    clienteId: z
      .union([z.number().int().positive(), z.string()])
      .optional()
      .nullable()
      .transform((v) => {
        if (v === "" || v == null) return null
        const n = typeof v === "number" ? v : Number(v)
        return Number.isFinite(n) && n > 0 ? n : null
      }),

    equipoId: z.string().min(1, "Debe seleccionar un equipo"),

    operadorId: z
      .string()
      .optional()
      .nullable()
      .or(z.literal(""))
      .transform((v) => (v === "" || v == null ? null : v)),

    nombreOperadorExterno: z
      .string()
      .trim()
      .max(150)
      .optional()
      .nullable()
      .or(z.literal(""))
      .transform((v) => (v === "" ? null : (v ?? null))),
  })
  .refine((d) => d.fechaFin >= d.fechaInicio, {
    message: "La fecha de fin no puede ser anterior a la fecha de inicio",
    path: ["fechaFin"],
  })
  .refine(
    (d) => {
      // Si hay operador externo, no debe haber operadorId y viceversa
      if (d.nombreOperadorExterno && d.operadorId) return false
      return true
    },
    {
      message: "Seleccione un operador O ingrese uno externo, no ambos",
      path: ["operadorId"],
    }
  )

export type GuiaAlquilerFormData = z.infer<typeof guiaAlquilerSchema>

// ============================================================
// FILTROS / BÚSQUEDA
// ============================================================

export const filtrosGuiaAlquilerSchema = z.object({
  busqueda: z.string().trim().default(""),
  estado: z
    .enum(["todos", "EN_PROCESO", "FINALIZADO", "ANULADO"])
    .default("todos"),
  estadoPago: z.enum(["todos", "PENDIENTE", "PAGADO"]).default("todos"),
  cotizacion: z.enum(["todos", "con", "sin"]).default("todos"),
  desde: z.string().optional(),
  hasta: z.string().optional(),
  pagina: z.coerce.number().int().min(1).default(1),
  porPagina: z.coerce.number().int().min(1).max(100).default(10),
})

export type FiltrosGuiaAlquiler = z.infer<typeof filtrosGuiaAlquilerSchema>

// ============================================================
// COTIZACIÓN
// ============================================================

export const cotizacionSchema = z.object({
  numeroCotizacion: z
    .string()
    .trim()
    .min(1, "El número de cotización es requerido")
    .max(50),
  subtotal: decimalRequerido,
  modoIGVCotizacion: modoIGVCotizacionEnum,
})

export type CotizacionFormData = z.infer<typeof cotizacionSchema>

// ============================================================
// PAGO
// ============================================================

export const pagoGuiaAlquilerSchema = z.object({
  metodoPago: metodoPagoEnum,
  numeroOperacion: z
    .string()
    .trim()
    .max(100)
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((v) => (v === "" ? null : (v ?? null))),
  fechaPago: z.coerce.date({
    message: "La fecha de pago es requerida",
  }),
  horaPago: z
    .string()
    .trim()
    .regex(horaRegex, "Formato de hora inválido (HH:mm)"),
})

export type PagoGuiaAlquilerFormData = z.infer<typeof pagoGuiaAlquilerSchema>

// ============================================================
// ASIGNAR CLIENTE (existente o nuevo)
// ============================================================

export const asignarClienteSchema = z
  .object({
    modo: z.enum(["existente", "nuevo"]),
    clienteId: z
      .union([z.number().int().positive(), z.string()])
      .optional()
      .nullable(),
    // Datos para cliente nuevo
    tipoDocumento: z.enum(["DNI", "RUC"]).optional(),
    numeroDocumento: z.string().trim().optional(),
    nombreCompleto: z.string().trim().optional(),
    telefono: z.string().trim().optional(),
    observaciones: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.modo === "existente") {
      const id =
        typeof data.clienteId === "string"
          ? Number(data.clienteId)
          : data.clienteId
      if (!id || !Number.isInteger(id) || id <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debe seleccionar un cliente",
          path: ["clienteId"],
        })
      }
    } else {
      if (!data.tipoDocumento) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Seleccione el tipo de documento",
          path: ["tipoDocumento"],
        })
      }
      if (!data.numeroDocumento || data.numeroDocumento.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Documento inválido",
          path: ["numeroDocumento"],
        })
      }
      if (!data.nombreCompleto || data.nombreCompleto.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingrese el nombre completo",
          path: ["nombreCompleto"],
        })
      }
    }
  })

export type AsignarClienteFormData = z.infer<typeof asignarClienteSchema>

// ============================================================
// CAMBIAR ESTADO
// ============================================================

export const cambiarEstadoGuiaAlquilerSchema = z.object({
  estado: estadoGuiaAlquilerEnum,
})

export type CambiarEstadoGuiaAlquilerFormData = z.infer<
  typeof cambiarEstadoGuiaAlquilerSchema
>
