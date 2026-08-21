// modules\vehiculos\vehiculos.schema.ts

import { z } from "zod";

/**
 * Schema principal para crear y editar vehículos.
 */
export const vehiculoSchema = z.object({
  placa: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, "La placa es obligatoria")
    .max(
      10,
      "La placa no puede superar los 10 caracteres",
    )
    .regex(
      /^[A-Z0-9-]+$/,
      "La placa solo puede contener letras, números y guiones",
    ),
});