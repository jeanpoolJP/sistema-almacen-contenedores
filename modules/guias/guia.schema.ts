// modules/guias/guia.schema.ts

import { z } from "zod"

/**
 * Schema para los datos del cliente
 * utilizados al crear una guía.
 */
const clienteGuiaSchema = z.object({
  tipoDocumento: z.enum(["DNI", "RUC"]),

  numeroDocumento: z
    .string()
    .trim()
    .min(1, "El número de documento es obligatorio")
    .max(11, "El número de documento no puede superar los 11 caracteres"),

  nombreCompleto: z
    .string()
    .trim()
    .max(150, "El nombre no puede superar los 150 caracteres")
    .optional()
    .or(z.literal("")),
})

/**
 * Schema para los datos del contenedor
 * utilizados al crear una guía.
 */
const contenedorGuiaSchema = z.object({
  numeroContenedor: z
    .string()
    .trim()
    .min(1, "El número del contenedor es obligatorio")
    .max(20, "El número del contenedor no puede superar los 20 caracteres"),

  marca: z
    .string()
    .trim()
    .min(1, "La marca del contenedor es obligatoria")
    .max(100, "La marca no puede superar los 100 caracteres"),

  medida: z.number().int().positive("La medida debe ser mayor a 0"),

  tipo: z.enum(["NORMAL", "REEFER"]),
})

/**
 * Schema para los datos del transportista.
 */
/**
 * Schema para los datos del transportista.
 *
 * La empresa se identifica mediante su RUC.
 * Los datos adicionales de la empresa son opcionales
 * porque pueden ser completados únicamente cuando
 * se registra por primera vez.
 */
const transportistaGuiaSchema = z.object({
  ruc: z
    .string()
    .trim()
    .regex(/^\d{11}$/, "El RUC debe tener 11 dígitos"),

  empresaNombre: z
    .string()
    .trim()
    .min(1, "El nombre de la empresa es obligatorio")
    .max(150, "El nombre de la empresa no puede superar los 150 caracteres"),

  telefono: z
    .string()
    .trim()
    .max(20, "El teléfono no puede superar los 20 caracteres")
    .optional()
    .or(z.literal("")),

  contactoLogistico: z
    .string()
    .trim()
    .max(150, "El contacto logístico no puede superar los 150 caracteres")
    .optional()
    .or(z.literal("")),

  nombreEncargado: z
    .string()
    .trim()
    .max(150, "El nombre del encargado no puede superar los 150 caracteres")
    .optional()
    .or(z.literal("")),

  placa: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, "La placa es obligatoria")
    .max(10, "La placa no puede superar los 10 caracteres")
    .regex(
      /^[A-Z0-9-]+$/,
      "La placa solo puede contener letras, números y guiones"
    ),

  conductorNombre: z
    .string()
    .trim()
    .min(3, "El nombre del conductor debe tener al menos 3 caracteres")
    .max(100, "El nombre del conductor no puede superar los 100 caracteres"),

  numeroLicencia: z
    .string()
    .trim()
    .min(5, "El número de licencia no es válido")
    .max(30, "El número de licencia no puede superar los 30 caracteres")
    .regex(
      /^[A-Za-z0-9-]+$/,
      "El número de licencia solo puede contener letras, números y guiones"
    ),
})

/**
 * Schema para crear una guía.
 */
export const crearGuiaSchema = z
  .object({
    numeroGuia: z
      .string()
      .trim()
      .regex(/^\d+$/, "El número de guía solo puede contener números")
      .transform((valor) => {
        const numero = Number(valor)

        if (numero > 999999) {
          throw new Error("El número de guía no puede tener más de 6 dígitos")
        }

        return numero.toString().padStart(6, "0")
      }),

    cliente: clienteGuiaSchema.nullable().optional(),

    contenedor: contenedorGuiaSchema,

    transportistaIngreso: transportistaGuiaSchema,

    fechaIngreso: z.date({
      message: "La fecha de ingreso es obligatoria",
    }),

    horaIngreso: z.date({
      message: "La hora de ingreso es obligatoria",
    }),

    tipoPrecio: z.enum(["ESTANDAR", "PERSONALIZADO"]),

    precioPrimerDia: z
      .number()
      .finite()
      .positive("El precio del primer día debe ser mayor a 0")
      .optional(),

    precioDiaAdicional: z
      .number()
      .finite()
      .min(0, "El precio adicional no puede ser negativo")
      .optional(),

    tratamientoIGV: z.enum(["SIN_IGV", "CON_IGV"]),

    observaciones: z
      .string()
      .trim()
      .max(5000, "Las observaciones no pueden superar los 5000 caracteres")
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    /**
     * Si el precio es PERSONALIZADO,
     * ambos valores son obligatorios.
     */
    if (data.tipoPrecio === "PERSONALIZADO") {
      if (data.precioPrimerDia === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["precioPrimerDia"],
          message:
            "El precio del primer día es obligatorio para un precio personalizado",
        })
      }

      if (data.precioDiaAdicional === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["precioDiaAdicional"],
          message:
            "El precio adicional es obligatorio para un precio personalizado",
        })
      }
    }
  })

/**
 * Schema para registrar la salida
 * de una guía.
 */
export const registrarSalidaGuiaSchema = z.object({
  guiaId: z.number().int().positive(),

  transportistaSalida: transportistaGuiaSchema,

  fechaSalida: z.date({
    message: "La fecha de salida es obligatoria",
  }),

  horaSalida: z.date({
    message: "La hora de salida es obligatoria",
  }),

  diasAlmacenamiento: z
    .number()
    .int()
    .positive("Los días de almacenamiento deben ser mayores a 0"),

  tipoPrecio: z.enum(["ESTANDAR", "PERSONALIZADO"]),

  precioPrimerDia: z
    .number()
    .nonnegative("El precio del primer día no puede ser negativo"),

  precioDiaAdicional: z
    .number()
    .nonnegative("El precio de los días adicionales no puede ser negativo"),

  tratamientoIGV: z.enum(["SIN_IGV", "CON_IGV"]),
})

export type CrearGuiaSchema = z.infer<typeof crearGuiaSchema>

export type RegistrarSalidaGuiaSchema = z.infer<
  typeof registrarSalidaGuiaSchema
>

export const registrarPagoGuiaSchema = z.object({
  guiaId: z.number().int().positive(),

  metodoPago: z.enum([
    "EFECTIVO",
    "YAPE",
    "PLIN",
    "TRANSFERENCIA",
    "TARJETA",
    "OTRO",
  ]),

  cliente: clienteGuiaSchema.nullable().optional(),

  numeroOperacion: z
    .string()
    .trim()
    .max(100, "El número de operación es demasiado largo")
    .optional()
    .nullable(),

  fechaPago: z.date({
    message: "La fecha de pago es obligatoria",
  }),

  horaPago: z.date({
    message: "La hora de pago es obligatoria",
  }),
})

export type RegistrarPagoGuiaSchema = z.infer<typeof registrarPagoGuiaSchema>
