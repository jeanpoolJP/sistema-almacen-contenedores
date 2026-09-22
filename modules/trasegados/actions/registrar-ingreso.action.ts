"use server"

import { ZodError } from "zod"

import { registrarIngresoTrasegadoService } from "../services/registrar-ingreso.service"
import type { RegistrarIngresoInput } from "../schemas/registrar-ingreso.schema"

export async function registrarIngresoAction(input: RegistrarIngresoInput) {
  try {
    const data = await registrarIngresoTrasegadoService(input)
    return {
      success: true as const,
      data,
      message: "Ingreso registrado correctamente.",
    }
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof ZodError
          ? "Revisa los datos del ingreso."
          : error instanceof Error
            ? error.message
            : "No se pudo registrar el ingreso.",
    }
  }
}
