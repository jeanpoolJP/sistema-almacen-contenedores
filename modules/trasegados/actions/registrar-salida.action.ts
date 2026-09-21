// modules\trasegados\actions\registrar-salida.action.ts

"use server"

import { revalidatePath } from "next/cache"
import { ZodError } from "zod"

import {
  listarElementosPendientesSalidaService,
  registrarSalidaService,
} from "../services/registrar-salida.service"
import type { RegistrarSalidaInput } from "../schemas/registrar-salida.schema"
import type { ElementoPendienteSalida } from "../types/registrar-salida.types"

export type RegistrarSalidaActionResult =
  | { success: true; message: string }
  | { success: false; message: string; errors?: Record<string, string[]> }

export async function registrarSalidaAction(
  input: RegistrarSalidaInput
): Promise<RegistrarSalidaActionResult> {
  try {
    await registrarSalidaService(input)

    revalidatePath("/admin/trasegados")
    revalidatePath(`/admin/trasegados/${input.guiaTrasegadoId}`)

    return {
      success: true,
      message: "Salida registrada correctamente.",
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: "Revisa los datos ingresados.",
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

    console.error("[registrarSalidaAction]", error)
    return { success: false, message: "Error inesperado." }
  }
}

export type ListarElementosPendientesResult =
  | { success: true; data: ElementoPendienteSalida[] }
  | { success: false; message: string }

export async function listarElementosPendientesAction(
  guiaTrasegadoId: number
): Promise<ListarElementosPendientesResult> {
  try {
    const data = await listarElementosPendientesSalidaService(guiaTrasegadoId)
    return { success: true, data }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: error.message }
    }
    console.error("[listarElementosPendientesAction]", error)
    return { success: false, message: "Error inesperado." }
  }
}
