"use server"

import { consultarMovimientosSchema } from "../schemas/movimientos.schema"
import { movimientosService } from "../services/movimientos.service"
import type { MovimientosActionResult } from "../types/movimientos.types"
import { requerirSesion } from "@/modules/auth/lib/require-auth"

export async function consultarMovimientosAction(
  input: unknown
): Promise<MovimientosActionResult> {
  const resultado = consultarMovimientosSchema.safeParse(input)
  if (!resultado.success) {
    return {
      success: false,
      error:
        resultado.error.issues[0]?.message ??
        "El rango de fechas no es válido.",
    }
  }

  try {
    await requerirSesion()
    const data = await movimientosService.consultar(
      resultado.data.desde || undefined,
      resultado.data.hasta || undefined
    )
    return { success: true, data }
  } catch (error) {
    if (error instanceof Error && error.message === "No autorizado") {
      return { success: false, error: "No autorizado." }
    }
    console.error("[consultarMovimientosAction]", error)
    return {
      success: false,
      error: "No se pudo generar el reporte de movimientos.",
    }
  }
}
