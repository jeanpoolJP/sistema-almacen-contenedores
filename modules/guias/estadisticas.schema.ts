import { z } from "zod"

import { PERIODOS_ESTADISTICAS_GUIAS } from "./estadisticas.types"

export const filtroEstadisticasGuiasSchema = z
  .object({
    periodo: z.enum(PERIODOS_ESTADISTICAS_GUIAS),
    fechaDesde: z.iso.date().optional(),
    fechaHasta: z.iso.date().optional(),
  })
  .superRefine((filtro, ctx) => {
    if (filtro.periodo !== "RANGO") return

    if (!filtro.fechaDesde) {
      ctx.addIssue({
        code: "custom",
        path: ["fechaDesde"],
        message: "Selecciona la fecha inicial.",
      })
    }
    if (!filtro.fechaHasta) {
      ctx.addIssue({
        code: "custom",
        path: ["fechaHasta"],
        message: "Selecciona la fecha final.",
      })
    }
    if (
      filtro.fechaDesde &&
      filtro.fechaHasta &&
      filtro.fechaDesde > filtro.fechaHasta
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["fechaHasta"],
        message: "La fecha final debe ser igual o posterior a la inicial.",
      })
    }
  })
