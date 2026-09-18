// modules\trasegados\schemas\listar-guias-trasegado.schema.ts

import { z } from "zod"

/**
 * Schema de filtros para el listado de guías de trasegado.
 *
 * Todos los campos son opcionales.
 * - Las fechas llegan como strings "YYYY-MM-DD" desde la UI.
 * - La paginación es 1-indexed.
 */
export const listarGuiasTrasegadoSchema = z.object({
  // Búsqueda textual
  numeroGuia: z.string().trim().optional().or(z.literal("")),

  // Filtro por cliente
  numeroDocumentoCliente: z.string().trim().optional().or(z.literal("")),

  // Filtro por elemento
  numeroContenedor: z.string().trim().optional().or(z.literal("")),

  // Estados
  estado: z.enum(["EN_PROCESO", "FINALIZADO"]).optional(),

  estadoPago: z.enum(["PENDIENTE", "PAGADO"]).optional(),

  // Rangos de fecha (strings YYYY-MM-DD en horario Lima)
  fechaIngresoDesde: z.string().optional().or(z.literal("")),
  fechaIngresoHasta: z.string().optional().or(z.literal("")),

  fechaSalidaDesde: z.string().optional().or(z.literal("")),
  fechaSalidaHasta: z.string().optional().or(z.literal("")),

  // Paginación
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),

  // Orden
  ordenarPor: z
    .enum(["fechaIngreso", "numeroGuia", "totalPagar"])
    .default("fechaIngreso"),
  orden: z.enum(["asc", "desc"]).default("desc"),
})

export type ListarGuiasTrasegadoInput = z.infer<
  typeof listarGuiasTrasegadoSchema
>
