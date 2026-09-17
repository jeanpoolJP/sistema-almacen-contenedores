// modules/trasegados/actions/crear-guia-trasegado.action.ts

"use server"

import { ZodError } from "zod"

import { crearGuiaTrasegadoService } from "../services/crear-guia-trasegado.service"
import type { CrearGuiaTrasegadoInput } from "../schemas/crear-guia-trasegado.schema"
import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate"

/**
 * Resultado estándar de la acción para crear una guía de trasegado.
 */
export type CrearGuiaTrasegadoActionResult =
  | {
      success: true
      message: string
      data: Awaited<ReturnType<typeof crearGuiaTrasegadoService>>
    }
  | {
      success: false
      message: string
      errors?: Record<string, string[]>
    }

/**
 * Crea una guía de trasegado desde el formulario.
 *
 * Responsabilidades:
 * - Recibir los datos enviados por el cliente.
 * - Delegar la validación y creación al servicio.
 * - Convertir los errores en una respuesta segura para la UI.
 *
 * La lógica de negocio y las operaciones de base de datos
 * pertenecen a crearGuiaTrasegadoService.
 *
 * @param input Datos del formulario de creación.
 * @returns Resultado de la operación para mostrar en la interfaz.
 */
export async function crearGuiaTrasegadoAction(
  input: CrearGuiaTrasegadoInput
): Promise<CrearGuiaTrasegadoActionResult> {
  try {
    const guia = await crearGuiaTrasegadoService(input)

    // Actualiza los datos asociados a la página de trasegados.
    revalidatePath("/admin/trasegados")

    return {
      success: true,
      message: "La guía de trasegado se creó correctamente.",
      data: guia,
    }
  } catch (error) {
    // Errores de validación de Zod
    if (error instanceof ZodError) {
      const flattenedErrors = error.flatten().fieldErrors

      return {
        success: false,
        message: "Revisa los datos ingresados.",
        errors: Object.fromEntries(
          Object.entries(flattenedErrors).map(([key, messages]) => [
            key,
            (messages ?? []) as string[],
          ])
        ),
      }
    }

    // Errores esperados de reglas de negocio
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      }
    }

    // Error inesperado
    console.error("[crearGuiaTrasegadoAction] Error inesperado:", error)

    return {
      success: false,
      message: "Ocurrió un error inesperado al crear la guía de trasegado.",
    }
  }
}
