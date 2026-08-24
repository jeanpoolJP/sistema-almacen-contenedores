import { z } from "zod";

export const configuracionPrecioSchema = z.object({
  precioPrimerDia: z
    .number()
    .positive("El precio del primer día debe ser mayor a 0"),

  precioDiaAdicional: z
    .number()
    .positive("El precio del día adicional debe ser mayor a 0"),

  porcentajeIGV: z
    .number()
    .min(0, "El IGV no puede ser negativo")
    .max(100, "El IGV no puede ser mayor a 100"),
});

export type ConfiguracionPrecioInput = z.infer<
  typeof configuracionPrecioSchema
>;