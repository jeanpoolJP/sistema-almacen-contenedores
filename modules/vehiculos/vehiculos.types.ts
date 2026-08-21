// modules\vehiculos\vehiculos.types.ts

import type { Vehiculo as PrismaVehiculo } from "@/lib/generated/prisma/client";

import type { vehiculoSchema } from "./vehiculos.schema";

import type { z } from "zod";

/**
 * Datos utilizados por el formulario de vehículos.
 *
 * Corresponde al input original de Zod.
 */
export type VehiculoFormData = z.input<
  typeof vehiculoSchema
>;

/**
 * Datos después de pasar por la validación de Zod.
 */
export type VehiculoFormValidated = z.output<
  typeof vehiculoSchema
>;

/**
 * Datos completos de un vehículo.
 *
 * Corresponde directamente al modelo generado por Prisma.
 */
export type Vehiculo = PrismaVehiculo;