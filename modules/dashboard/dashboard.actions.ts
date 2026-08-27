"use server"

import { obtenerDashboard } from "./dashboard.service"

/**
 * Obtiene los datos actuales del Dashboard.
 */
export async function obtenerDashboardAction() {
  try {
    const data = await obtenerDashboard()

    return {
      success: true as const,
      data,
    }
  } catch (error) {
    console.error("Error al obtener dashboard:", error)

    return {
      success: false as const,
      message: "No se pudo obtener la información del dashboard.",
    }
  }
}
