// modules\conductores\conductores.types.ts

import type { Conductor as PrismaConductor } from "@/lib/generated/prisma/client";

import type {
  conductorSchema,
  conductorLicenciaSchema,
} from "./conductores.schema";

import type { z } from "zod";

/**
 * Datos utilizados por el formulario de conductores.
 *
 * Corresponde al input original de Zod.
 */
export type ConductorFormData =
  z.input<typeof conductorSchema>;

/**
 * Datos después de pasar por la validación de Zod.
 */
export type ConductorFormValidated =
  z.output<typeof conductorSchema>;

/**
 * Datos completos de un conductor.
 *
 * Corresponde directamente al modelo generado por Prisma.
 */
export type Conductor = PrismaConductor;

/**
 * Datos utilizados para buscar un conductor
 * mediante su número de licencia.
 */
export type ConductorLicenciaData =
  z.input<typeof conductorLicenciaSchema>;