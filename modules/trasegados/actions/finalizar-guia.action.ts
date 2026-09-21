// modules\trasegados\actions\finalizar-guia.action.ts

"use server"

import { revalidatePath } from "next/cache"
import { ZodError } from "zod"

import {
  cambiarEstadoGuiaService,
  GuiaTienePendientesError,
  listarPendientesFinalizarService,
} from "../services/finalizar-guia.service"
import type { CambiarEstadoGuiaInput } from "../schemas/finalizar-guia.schema"
import type { ElementoPendienteSalida } from "../types/registrar-salida.types"

// ------------------------------------------------------------
// CAMBIAR ESTADO
// ------------------------------------------------------------

export type CambiarEstadoGuiaActionResult =
  | { success: true; message: string }
  | {
      success: false
      message: string
      /** Presente cuando el error es "hay pendientes". */
      pendientes?: ElementoPendienteSalida[]
      errors?: Record<string, string[]>
    }

export async function cambiarEstadoGuiaAction(
  input: CambiarEstadoGuiaInput
): Promise<CambiarEstadoGuiaActionResult> {
  try {
    await cambiarEstadoGuiaService(input)

    revalidatePath("/admin/trasegados")
    revalidatePath(`/admin/trasegados/${input.guiaTrasegadoId}`)

    return {
      success: true,
      message: input.finalizar
        ? "Guía finalizada correctamente."
        : "Guía reactivada correctamente.",
    }
  } catch (error) {
    // Pendientes bloqueantes al finalizar
    if (error instanceof GuiaTienePendientesError) {
      return {
        success: false,
        message: error.message,
        pendientes: error.pendientes,
      }
    }

    if (error instanceof ZodError) {
      return {
        success: false,
        message: "Datos inválidos.",
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

    console.error("[cambiarEstadoGuiaAction]", error)
    return { success: false, message: "Error inesperado." }
  }
}

// ------------------------------------------------------------
// LISTAR PENDIENTES (para el modal de confirmación)
// ------------------------------------------------------------

export type ListarPendientesFinalizarActionResult =
  | { success: true; pendientes: ElementoPendienteSalida[] }
  | { success: false; message: string }

export async function listarPendientesFinalizarAction(
  guiaTrasegadoId: number
): Promise<ListarPendientesFinalizarActionResult> {
  try {
    const pendientes = await listarPendientesFinalizarService(guiaTrasegadoId)
    return { success: true, pendientes }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: error.message }
    }
    console.error("[listarPendientesFinalizarAction]", error)
    return { success: false, message: "Error inesperado." }
  }
}
