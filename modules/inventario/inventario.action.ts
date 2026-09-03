// modules/inventario/inventario.action.ts

"use server"

import { ResultadoInventario } from "@/lib/generated/prisma/client"

import {
  listarInventarios,
  obtenerInventario,
  obtenerGuiasDisponibles,
  crearInventario,
  verificarDetalle,
  finalizarInventario,
  obtenerEstadisticas,
} from "./inventario.service"

/**
 * Obtiene los inventarios con paginacion.
 */
export async function listarInventariosAction(
  page: number = 1,
  limit: number = 10
) {
  try {
    return await listarInventarios(page, limit)
  } catch (error) {
    console.error("Error al listar inventarios:", error)

    throw new Error("No se pudieron obtener los inventarios.")
  }
}

/**
 * Obtiene un inventario específico.
 */
export async function obtenerInventarioAction(id: number) {
  try {
    return await obtenerInventario(id)
  } catch (error) {
    console.error("Error al obtener inventario:", error)

    throw new Error(
      error instanceof Error
        ? error.message
        : "No se pudo obtener el inventario."
    )
  }
}

/**
 * Obtiene las guías actualmente almacenadas.
 *
 * Se utiliza principalmente antes de crear un inventario
 * para mostrar cuántos contenedores serán incluidos.
 */
export async function obtenerGuiasDisponiblesAction() {
  try {
    return await obtenerGuiasDisponibles()
  } catch (error) {
    console.error("Error al obtener guías disponibles:", error)

    throw new Error("No se pudieron obtener las guías almacenadas.")
  }
}

/**
 * Crea un nuevo inventario.
 *
 * El service se encarga de obtener automáticamente
 * las guías cuyo estado sea ALMACENADO.
 */

export async function crearInventarioAction(
  fecha: Date,
  observaciones?: string
) {
  if (!(fecha instanceof Date) || isNaN(fecha.getTime())) {
    return {
      success: false,
      message: "La fecha del inventario no es válida.",
    }
  }

  try {
    const inventario = await crearInventario(fecha, observaciones)

    return {
      success: true,
      data: inventario,
    }
  } catch (error) {
    console.error("Error al crear inventario:", error)

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo crear el inventario.",
    }
  }
}
/**
 * Registra la verificación física de un contenedor.
 */
export async function verificarDetalleAction(
  inventarioId: number,
  detalleId: number,
  resultado: ResultadoInventario,
  observaciones?: string
) {
  try {
    return await verificarDetalle(
      inventarioId,
      detalleId,
      resultado,
      observaciones
    )
  } catch (error) {
    console.error("Error al verificar detalle de inventario:", error)

    throw new Error(
      error instanceof Error
        ? error.message
        : "No se pudo actualizar la verificación."
    )
  }
}

/**
 * Finaliza un inventario.
 */
export async function finalizarInventarioAction(id: number) {
  try {
    return await finalizarInventario(id)
  } catch (error) {
    console.error("Error al finalizar inventario:", error)

    throw new Error(
      error instanceof Error
        ? error.message
        : "No se pudo finalizar el inventario."
    )
  }
}

/**
 * Obtiene las estadísticas de un inventario.
 */
export async function obtenerEstadisticasAction(id: number) {
  try {
    return await obtenerEstadisticas(id)
  } catch (error) {
    console.error("Error al obtener estadísticas:", error)

    throw new Error(
      error instanceof Error
        ? error.message
        : "No se pudieron obtener las estadísticas."
    )
  }
}
