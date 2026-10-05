import { z } from "zod"

export const MODOS_IGV_COTIZACION = [
  "SIN_IGV",
  "CON_IGV",
  "IGV_INCLUIDO",
] as const

export type ModoIGVCotizacionValue = (typeof MODOS_IGV_COTIZACION)[number]

export const cotizacionSchema = z.object({
  guiaTrasegadoId: z
    .number({ error: "El ID de la guía es obligatorio." })
    .int()
    .positive("El ID de la guía es obligatorio."),
  numeroCotizacion: z
    .string()
    .trim()
    .min(1, "El número de cotización es obligatorio.")
    .max(100, "El número de cotización no puede superar 100 caracteres."),
  montoIngresado: z
    .number({ error: "El monto a pagar es obligatorio." })
    .positive("El monto debe ser mayor a cero.")
    .max(9_999_999.99, "El monto excede el límite permitido."),
  modoIGVCotizacion: z.enum(MODOS_IGV_COTIZACION),
})

export type CotizacionInput = z.infer<typeof cotizacionSchema>
