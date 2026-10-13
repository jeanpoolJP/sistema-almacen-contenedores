// modules/control-alquiler/control-alquiler.actions.ts
"use server"

import { revalidatePath } from "next/cache"

import {
  actualizarGuiaAlquiler,
  asignarCliente,
  asignarCotizacion,
  asignarPago,
  cambiarEstadoGuiaAlquiler,
  registrarGuiaAlquiler,
} from "./control-alquiler.service"

import type {
  AsignarClienteFormData,
  CambiarEstadoGuiaAlquilerFormData,
  CotizacionFormData,
  GuiaAlquilerFormData,
  PagoGuiaAlquilerFormData,
} from "./control-alquiler.schema"

import type {
  ActionResult,
  GuiaAlquilerListItem,
} from "./control-alquiler.types"

// ============================================================
// CREAR
// ============================================================

export async function registrarGuiaAlquilerAction(
  data: GuiaAlquilerFormData
): Promise<ActionResult<GuiaAlquilerListItem>> {
  try {
    const guia = await registrarGuiaAlquiler(data)
    revalidatePath("/control-alquiler")
    return {
      success: true,
      data: guia,
      message: "Guía de alquiler registrada correctamente",
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al registrar la guía de alquiler",
    }
  }
}

// ============================================================
// ACTUALIZAR
// ============================================================

export async function actualizarGuiaAlquilerAction(
  id: string,
  data: GuiaAlquilerFormData
): Promise<ActionResult<GuiaAlquilerListItem>> {
  try {
    const guia = await actualizarGuiaAlquiler(id, data)
    revalidatePath("/control-alquiler")
    return {
      success: true,
      data: guia,
      message: "Guía de alquiler actualizada correctamente",
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al actualizar la guía de alquiler",
    }
  }
}

// ============================================================
// ASIGNAR CLIENTE
// ============================================================

export async function asignarClienteAction(
  guiaId: string,
  data: AsignarClienteFormData
): Promise<ActionResult<GuiaAlquilerListItem>> {
  try {
    const guia = await asignarCliente(guiaId, data)
    revalidatePath("/control-alquiler")
    return {
      success: true,
      data: guia,
      message: "Cliente asignado correctamente",
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al asignar el cliente",
    }
  }
}

// ============================================================
// ASIGNAR COTIZACIÓN
// ============================================================

export async function asignarCotizacionAction(
  guiaId: string,
  data: CotizacionFormData
): Promise<ActionResult<GuiaAlquilerListItem>> {
  try {
    const guia = await asignarCotizacion(guiaId, data)
    revalidatePath("/control-alquiler")
    return {
      success: true,
      data: guia,
      message: "Cotización asignada correctamente",
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al asignar la cotización",
    }
  }
}

// ============================================================
// ASIGNAR PAGO
// ============================================================

export async function asignarPagoAction(
  guiaId: string,
  data: PagoGuiaAlquilerFormData
): Promise<ActionResult<GuiaAlquilerListItem>> {
  try {
    const guia = await asignarPago(guiaId, data)
    revalidatePath("/control-alquiler")
    return {
      success: true,
      data: guia,
      message: "Pago registrado correctamente",
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al registrar el pago",
    }
  }
}

// ============================================================
// CAMBIAR ESTADO
// ============================================================

export async function cambiarEstadoGuiaAlquilerAction(
  guiaId: string,
  data: CambiarEstadoGuiaAlquilerFormData
): Promise<ActionResult<GuiaAlquilerListItem>> {
  try {
    const guia = await cambiarEstadoGuiaAlquiler(guiaId, data)
    revalidatePath("/control-alquiler")
    return {
      success: true,
      data: guia,
      message: "Estado actualizado correctamente",
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al cambiar el estado",
    }
  }
}
