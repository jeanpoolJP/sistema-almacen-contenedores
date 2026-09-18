// modules\trasegados\actions\listar-guias-trasegado.action.ts

"use server"

import { ZodError } from "zod"

import { listarGuiasTrasegadoService } from "../services/listar-guias-trasegado.service"
import type { ListarGuiasTrasegadoInput } from "../schemas/listar-guias-trasegado.schema"
import type { ListarGuiasTrasegadoResult } from "../types/guia-trasegado-listado.types"

export type ListarGuiasTrasegadoActionResult =
  | { success: true; data: ListarGuiasTrasegadoResult }
  | { success: false; message: string; errors?: Record<string, string[]> }

/**
 * Server action para listar guías de trasegado.
 * Llamada desde el hook con los filtros actuales.
 */
export async function listarGuiasTrasegadoAction(
  input: Partial<ListarGuiasTrasegadoInput>
): Promise<ListarGuiasTrasegadoActionResult> {
  try {
    const data = await listarGuiasTrasegadoService(input)
    return { success: true, data }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: "Filtros inválidos.",
        errors: Object.fromEntries(
          Object.entries(error.flatten().fieldErrors).map(([k, v]) => [
            k,
            (v ?? []) as string[],
          ])
        ),
      }
    }
    if (error instanceof Error) {
      return { success: false, message: error.message }
    }
    console.error("[listarGuiasTrasegadoAction]", error)
    return { success: false, message: "Error inesperado." }
  }
}
