import { z } from "zod"

/**
 * Entrada para generar el reporte de inventario de un cliente.
 */
export const generarReporteInventarioSchema = z.object({
  clienteId: z
    .number({ message: "Debes seleccionar un cliente." })
    .int("El ID del cliente debe ser un número entero.")
    .positive("Debes seleccionar un cliente válido."),
})

export type GenerarReporteInventarioInput = z.infer<
  typeof generarReporteInventarioSchema
>
