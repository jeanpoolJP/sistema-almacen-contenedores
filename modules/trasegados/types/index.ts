// modules\trasegados\types\index.ts

import type { z } from "zod"
import type { elementoTrasegadoSchema } from "../schemas/crear-guia-trasegado.schema"

/**
 * Tipo de elemento individual en el formulario.
 */
export type ElementoTrasegadoFormValue = z.infer<typeof elementoTrasegadoSchema>

/**
 * Tipo discriminado para acceder a los campos según el tipo.
 */
export type TipoElementoTrasegado =
  "CONTENEDOR" | "FLAT_RACK" | "MERCADERIA" | "MAQUINARIA"

/**
 * Etiquetas legibles para mostrar al usuario.
 */
export const ETIQUETAS_TIPO_ELEMENTO: Record<TipoElementoTrasegado, string> = {
  CONTENEDOR: "Contenedor",
  FLAT_RACK: "Flat Rack",
  MERCADERIA: "Mercadería",
  MAQUINARIA: "Maquinaria",
}

export const ETIQUETAS_TIPO_VEHICULO = {
  PORTA_CONTENEDORES: "Porta-contenedores",
  CAMA_BAJA: "Cama baja",
  OTRO: "Otro",
} as const
