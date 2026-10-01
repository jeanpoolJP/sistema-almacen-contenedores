import { z } from "zod"

function esFechaValida(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const fecha = new Date(`${value}T00:00:00.000Z`)
  return (
    !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === value
  )
}

export const consultarMovimientosSchema = z
  .object({
    desde: z
      .string()
      .refine(
        (value) => value === "" || esFechaValida(value),
        "La fecha inicial no es válida."
      )
      .optional()
      .default(""),
    hasta: z
      .string()
      .refine(
        (value) => value === "" || esFechaValida(value),
        "La fecha final no es válida."
      )
      .optional()
      .default(""),
  })
  .refine(
    (value) => !value.desde || !value.hasta || value.desde <= value.hasta,
    {
      message: "La fecha inicial debe ser anterior o igual a la fecha final.",
      path: ["desde"],
    }
  )

export type ConsultarMovimientosInput = z.infer<
  typeof consultarMovimientosSchema
>
