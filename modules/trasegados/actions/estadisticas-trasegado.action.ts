"use server"

import { ZodError } from "zod"

import { filtroEstadisticasTrasegadoSchema } from "../schemas/estadisticas-trasegado.schema"
import { obtenerEstadisticasTrasegadoService } from "../services/estadisticas-trasegado.service"
import type { EstadisticasTrasegado } from "../types/estadisticas-trasegado.types"
import type { FiltroEstadisticasTrasegado } from "../types/estadisticas-trasegado.types"

export type ObtenerEstadisticasTrasegadoResult =
  | { success: true; data: EstadisticasTrasegado }
  | { success: false; message: string }

export async function obtenerEstadisticasTrasegadoAction(
  filtroInput: FiltroEstadisticasTrasegado
): Promise<ObtenerEstadisticasTrasegadoResult> {
  try {
    const filtro = filtroEstadisticasTrasegadoSchema.parse(filtroInput)
    const data = await obtenerEstadisticasTrasegadoService(filtro)
    return { success: true, data }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: "El periodo o rango de fechas seleccionado no es válido.",
      }
    }
    console.error("[obtenerEstadisticasTrasegadoAction]", error)
    return {
      success: false,
      message: "No se pudieron cargar las estadísticas de trasegados.",
    }
  }
}
