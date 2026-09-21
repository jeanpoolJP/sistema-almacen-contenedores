// modules\trasegados\actions\asignar-cliente.action.ts

"use server"

import { revalidatePath } from "next/cache"
import { ZodError } from "zod"

import { asignarClienteService } from "../services/asignar-cliente.service"
import type { AsignarClienteInput } from "../schemas/asignar-cliente.schema"

export type AsignarClienteActionResult =
  | { success: true; message: string }
  | { success: false; message: string; errors?: Record<string, string[]> }

export async function asignarClienteAction(
  input: AsignarClienteInput
): Promise<AsignarClienteActionResult> {
  try {
    await asignarClienteService(input)

    // Refresca el listado y el detalle de esa guía
    revalidatePath("/admin/trasegados")
    revalidatePath(`/admin/trasegados/${input.guiaTrasegadoId}`)

    return {
      success: true,
      message: "Cliente asignado correctamente.",
    }
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors = error.flatten().fieldErrors
      return {
        success: false,
        message: "Revisa los datos ingresados.",
        errors: Object.fromEntries(
          Object.entries(fieldErrors).map(([k, v]) => [
            k,
            (v ?? []) as string[],
          ])
        ),
      }
    }

    if (error instanceof Error) {
      return { success: false, message: error.message }
    }

    console.error("[asignarClienteAction]", error)
    return { success: false, message: "Error inesperado." }
  }
}
