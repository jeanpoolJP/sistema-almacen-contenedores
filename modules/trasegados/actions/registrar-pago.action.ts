// modules\trasegados\actions\registrar-pago.action.ts

"use server"

import { revalidatePath } from "next/cache"
import { ZodError } from "zod"

import {
  obtenerEstadoPagoService,
  registrarPagoService,
  revertirPagoService,
} from "../services/registrar-pago.service"
import type { RegistrarPagoInput } from "../schemas/registrar-pago.schema"
import type { EstadoPagoGuia } from "../types/pago.types"

// ------------------------------------------------------------
// REGISTRAR PAGO
// ------------------------------------------------------------

export type RegistrarPagoActionResult =
  | { success: true; message: string }
  | { success: false; message: string; errors?: Record<string, string[]> }

export async function registrarPagoAction(
  input: RegistrarPagoInput
): Promise<RegistrarPagoActionResult> {
  try {
    await registrarPagoService(input)

    revalidatePath("/admin/trasegados")
    revalidatePath(`/admin/trasegados/${input.guiaTrasegadoId}`)

    return { success: true, message: "Pago registrado correctamente." }
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
    console.error("[registrarPagoAction]", error)
    return { success: false, message: "Error inesperado." }
  }
}

// ------------------------------------------------------------
// REVERTIR PAGO
// ------------------------------------------------------------

export type RevertirPagoActionResult =
  { success: true; message: string } | { success: false; message: string }

export async function revertirPagoAction(
  guiaTrasegadoId: number
): Promise<RevertirPagoActionResult> {
  try {
    await revertirPagoService(guiaTrasegadoId)

    revalidatePath("/admin/trasegados")
    revalidatePath(`/admin/trasegados/${guiaTrasegadoId}`)

    return { success: true, message: "Pago revertido correctamente." }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: error.message }
    }
    console.error("[revertirPagoAction]", error)
    return { success: false, message: "Error inesperado." }
  }
}

// ------------------------------------------------------------
// OBTENER ESTADO DE PAGO
// ------------------------------------------------------------

export type ObtenerEstadoPagoActionResult =
  { success: true; data: EstadoPagoGuia } | { success: false; message: string }

export async function obtenerEstadoPagoAction(
  guiaTrasegadoId: number
): Promise<ObtenerEstadoPagoActionResult> {
  try {
    const data = await obtenerEstadoPagoService(guiaTrasegadoId)
    return { success: true, data }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: error.message }
    }
    console.error("[obtenerEstadoPagoAction]", error)
    return { success: false, message: "Error inesperado." }
  }
}
