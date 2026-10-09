"use server"

import { revalidatePath } from "next/cache"
import { ZodError } from "zod"

import { requerirSesion } from "@/modules/auth/lib/require-auth"

import type {
  ActualizarGuiaAlquilerInput,
  CotizacionAlquilerInput,
  GuiaAlquilerInput,
  ListadoGuiasAlquilerInput,
  PagoAlquilerInput,
} from "../schemas/control-alquiler.schema"
import {
  actualizarGuiaAlquilerService,
  asignarClienteAlquilerService,
  crearGuiaAlquilerService,
  guardarCotizacionAlquilerService,
  listarGuiasAlquilerService,
  obtenerOpcionesAlquilerService,
  registrarPagoAlquilerService,
} from "../services/control-alquiler.service"

type ActionResult<T = undefined> =
  | { success: true; message: string; data: T }
  | { success: false; message: string }

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? "Revisa los datos ingresados."
  }
  if (error instanceof Error) return error.message
  return fallback
}

export async function listarGuiasAlquilerAction(
  input: ListadoGuiasAlquilerInput
): Promise<
  ActionResult<Awaited<ReturnType<typeof listarGuiasAlquilerService>>>
> {
  try {
    await requerirSesion()
    return {
      success: true,
      message: "",
      data: await listarGuiasAlquilerService(input),
    }
  } catch (error) {
    console.error("[listarGuiasAlquilerAction]", error)
    return {
      success: false,
      message: errorMessage(error, "No se pudieron cargar las guías."),
    }
  }
}

export async function obtenerOpcionesAlquilerAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof obtenerOpcionesAlquilerService>>>
> {
  try {
    await requerirSesion()
    return {
      success: true,
      message: "",
      data: await obtenerOpcionesAlquilerService(),
    }
  } catch (error) {
    console.error("[obtenerOpcionesAlquilerAction]", error)
    return {
      success: false,
      message: errorMessage(error, "No se pudieron cargar los datos."),
    }
  }
}

export async function crearGuiaAlquilerAction(
  input: GuiaAlquilerInput
): Promise<ActionResult> {
  try {
    await requerirSesion()
    await crearGuiaAlquilerService(input)
    revalidatePath("/admin/control-alquiler")
    return {
      success: true,
      message: "Guía de alquiler registrada.",
      data: undefined,
    }
  } catch (error) {
    console.error("[crearGuiaAlquilerAction]", error)
    return {
      success: false,
      message: errorMessage(error, "No se pudo registrar la guía."),
    }
  }
}

export async function actualizarGuiaAlquilerAction(
  input: ActualizarGuiaAlquilerInput
): Promise<ActionResult> {
  try {
    await requerirSesion()
    await actualizarGuiaAlquilerService(input)
    revalidatePath("/admin/control-alquiler")
    return {
      success: true,
      message: "Guía de alquiler actualizada.",
      data: undefined,
    }
  } catch (error) {
    console.error("[actualizarGuiaAlquilerAction]", error)
    return {
      success: false,
      message: errorMessage(error, "No se pudo actualizar la guía."),
    }
  }
}

export async function asignarClienteAlquilerAction(
  input: unknown
): Promise<ActionResult> {
  try {
    await requerirSesion()
    await asignarClienteAlquilerService(input)
    revalidatePath("/admin/control-alquiler")
    return {
      success: true,
      message: "Cliente asignado correctamente.",
      data: undefined,
    }
  } catch (error) {
    console.error("[asignarClienteAlquilerAction]", error)
    return {
      success: false,
      message: errorMessage(error, "No se pudo asignar el cliente."),
    }
  }
}

export async function guardarCotizacionAlquilerAction(
  input: CotizacionAlquilerInput
): Promise<ActionResult> {
  try {
    await requerirSesion()
    await guardarCotizacionAlquilerService(input)
    revalidatePath("/admin/control-alquiler")
    return {
      success: true,
      message: "Cotización guardada correctamente.",
      data: undefined,
    }
  } catch (error) {
    console.error("[guardarCotizacionAlquilerAction]", error)
    return {
      success: false,
      message: errorMessage(error, "No se pudo guardar la cotización."),
    }
  }
}

export async function registrarPagoAlquilerAction(
  input: PagoAlquilerInput
): Promise<ActionResult> {
  try {
    await requerirSesion()
    await registrarPagoAlquilerService(input)
    revalidatePath("/admin/control-alquiler")
    return {
      success: true,
      message:
        "Pago registrado correctamente. La guía ahora figura como pagada.",
      data: undefined,
    }
  } catch (error) {
    console.error("[registrarPagoAlquilerAction]", error)
    return {
      success: false,
      message: errorMessage(error, "No se pudo registrar el pago."),
    }
  }
}
