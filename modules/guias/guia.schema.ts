import { z } from "zod";

export const crearGuiaSchema = z.object({
  numeroGuia: z
    .string()
    .trim()
    .min(1, "El número de guía es obligatorio")
    .max(30, "El número de guía no puede superar los 30 caracteres"),

  clienteId: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),

  contenedorId: z
    .number()
    .int()
    .positive("Debe seleccionar un contenedor"),

  empresaTransporteIngresoId: z
    .number()
    .int()
    .positive("Debe seleccionar la empresa de transporte de ingreso"),

  vehiculoIngresoId: z
    .number()
    .int()
    .positive("Debe seleccionar el vehículo de ingreso"),

  conductorIngresoId: z
    .number()
    .int()
    .positive("Debe seleccionar el conductor de ingreso"),

  fechaIngreso: z.date({
    message: "La fecha de ingreso es obligatoria",
  }),

  horaIngreso: z.date({
    message: "La hora de ingreso es obligatoria",
  }),

  empresaTransporteSalidaId: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),

  vehiculoSalidaId: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),

  conductorSalidaId: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),

  fechaSalida: z
    .date()
    .nullable()
    .optional(),

  horaSalida: z
    .date()
    .nullable()
    .optional(),

  diasAlmacenamiento: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),

  tipoPrecio: z.enum([
    "ESTANDAR",
    "PERSONALIZADO",
  ]),

  precioPrimerDia: z
    .number()
    .finite()
    .positive("El precio del primer día debe ser mayor a 0"),

  precioDiaAdicional: z
    .number()
    .finite()
    .min(0, "El precio adicional no puede ser negativo"),

  subtotal: z
    .number()
    .finite()
    .min(0)
    .nullable()
    .optional(),

  porcentajeIGV: z
    .number()
    .finite()
    .min(0)
    .max(100)
    .nullable()
    .optional(),

  montoIGV: z
    .number()
    .finite()
    .min(0)
    .nullable()
    .optional(),

  montoTotal: z
    .number()
    .finite()
    .min(0)
    .nullable()
    .optional(),

  tratamientoIGV: z.enum([
    "SIN_IGV",
    "CON_IGV",
  ]),

  estado: z.enum([
    "ALMACENADO",
    "RETIRADO",
    "ANULADO",
  ]),

  observaciones: z
    .string()
    .trim()
    .max(
      5000,
      "Las observaciones no pueden superar los 5000 caracteres"
    )
    .nullable()
    .optional(),
});

export const actualizarSalidaGuiaSchema = z.object({
  guiaId: z
    .number()
    .int()
    .positive(),

  empresaTransporteSalidaId: z
    .number()
    .int()
    .positive("Debe seleccionar la empresa de transporte"),

  vehiculoSalidaId: z
    .number()
    .int()
    .positive("Debe seleccionar el vehículo"),

  conductorSalidaId: z
    .number()
    .int()
    .positive("Debe seleccionar el conductor"),

  fechaSalida: z.date({
    message: "La fecha de salida es obligatoria",
  }),

  horaSalida: z.date({
    message: "La hora de salida es obligatoria",
  }),
});

export type CrearGuiaSchema = z.infer<
  typeof crearGuiaSchema
>;

export type ActualizarSalidaGuiaSchema = z.infer<
  typeof actualizarSalidaGuiaSchema
>;