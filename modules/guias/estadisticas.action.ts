"use server"

import { ZodError } from "zod"

import { filtroEstadisticasGuiasSchema } from "./estadisticas.schema"
import { obtenerEstadisticasGuiasService } from "./estadisticas.service"
import type {
  EstadisticasGuias,
  FiltroEstadisticasGuias,
} from "./estadisticas.types"

export type ObtenerEstadisticasGuiasResult =
  | { success: true; data: EstadisticasGuias }
  | { success: false; message: string }

export async function obtenerEstadisticasGuiasAction(
  filtroInput: FiltroEstadisticasGuias
): Promise<ObtenerEstadisticasGuiasResult> {
  try {
    const filtro = filtroEstadisticasGuiasSchema.parse(filtroInput)
    const data = await obtenerEstadisticasGuiasService(filtro)
    return { success: true, data }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: "El periodo o rango de fechas seleccionado no es válido.",
      }
    }
    console.error("[obtenerEstadisticasGuiasAction]", error)
    return {
      success: false,
      message: "No se pudieron cargar las estadísticas de guías.",
    }
  }
}
