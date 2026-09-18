// modules\trasegados\actions\obtener-guia-trasegado.action.ts

"use server"

import { ZodError } from "zod"

import { obtenerGuiaTrasegadoService } from "../services/obtener-guia-trasegado.service"
import type { GuiaTrasegadoDetalle } from "../types/guia-trasegado-detalle.types"

export type ObtenerGuiaTrasegadoActionResult =
  | { success: true; data: GuiaTrasegadoDetalle }
  | { success: false; message: string }

export async function obtenerGuiaTrasegadoAction(
  id: number
): Promise<ObtenerGuiaTrasegadoActionResult> {
  try {
    const data = await obtenerGuiaTrasegadoService({ id })
    return { success: true, data }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, message: "ID inválido." }
    }
    if (error instanceof Error) {
      return { success: false, message: error.message }
    }
    console.error("[obtenerGuiaTrasegadoAction]", error)
    return { success: false, message: "Error inesperado." }
  }
}
