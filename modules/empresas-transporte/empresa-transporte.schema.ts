// modules\empresas-transporte\empresa-transporte.schema.ts

import { z } from "zod";

export const empresaTransporteSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre de la empresa es obligatorio")
    .max(150, "El nombre no puede superar los 150 caracteres"),

  ruc: z
    .string()
    .trim()
    .regex(/^\d{11}$/, "El RUC debe tener exactamente 11 dígitos")
    .optional()
    .or(z.literal("")),

  telefono: z
    .string()
    .trim()
    .max(20, "El teléfono no puede superar los 20 caracteres")
    .optional()
    .or(z.literal("")),
});

export const actualizarEmpresaTransporteSchema =
  empresaTransporteSchema.extend({
    id: z.number().int().positive(),
  });

export const cambiarEstadoEmpresaTransporteSchema = z.object({
  id: z.number().int().positive(),
  activo: z.boolean(),
});

export type EmpresaTransporteFormData = z.infer<
  typeof empresaTransporteSchema
>;