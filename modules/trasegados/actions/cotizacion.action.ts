"use server"

import { revalidatePath } from "next/cache"
import { ZodError } from "zod"

import { guardarCotizacionService } from "../services/cotizacion.service"
import type { CotizacionInput } from "../schemas/cotizacion.schema"

export type CotizacionActionResult =
  | { success: true; message: string }
  | { success: false; message: string; errors?: Record<string, string[]> }

export async function guardarCotizacionAction(
  input: CotizacionInput
): Promise<CotizacionActionResult> {
  try {
    await guardarCotizacionService(input)

    revalidatePath("/admin/trasegados")
    revalidatePath(`/admin/trasegados/${input.guiaTrasegadoId}`)

    return { success: true, message: "Cotización guardada correctamente." }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: "Revisa los datos ingresados.",
        errors: Object.fromEntries(
          Object.entries(error.flatten().fieldErrors).map(([key, value]) => [
            key,
            (value ?? []) as string[],
          ])
        ),
      }
    }
    if (error instanceof Error) {
      return { success: false, message: error.message }
    }
    console.error("[guardarCotizacionAction]", error)
    return { success: false, message: "Error inesperado." }
  }
}
