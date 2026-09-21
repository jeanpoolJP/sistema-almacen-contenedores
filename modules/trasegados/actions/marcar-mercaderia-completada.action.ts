// modules\trasegados\actions\marcar-mercaderia-completada.action.ts

"use server"

import { revalidatePath } from "next/cache"

import { marcarMercaderiaCompletadaService } from "../services/marcar-mercaderia-completada.service"

export type MarcarMercaderiaCompletadaActionResult =
  { success: true; message: string } | { success: false; message: string }

export async function marcarMercaderiaCompletadaAction(
  elementoId: number,
  guiaTrasegadoId: number,
  completada: boolean
): Promise<MarcarMercaderiaCompletadaActionResult> {
  try {
    await marcarMercaderiaCompletadaService(elementoId, completada)

    revalidatePath("/admin/trasegados")
    revalidatePath(`/admin/trasegados/${guiaTrasegadoId}`)

    return {
      success: true,
      message: completada
        ? "Mercadería marcada como completada."
        : "Mercadería reactivada para futuras salidas.",
    }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: error.message }
    }
    console.error("[marcarMercaderiaCompletadaAction]", error)
    return { success: false, message: "Error inesperado." }
  }
}
