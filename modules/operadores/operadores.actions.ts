"use server"

import { Prisma } from "@/lib/generated/prisma/client"
import { revalidatePath } from "next/cache"
import { ZodError } from "zod"
import { requerirSesion } from "@/modules/auth/lib/require-auth"
import { operadorSchema } from "./operadores.schema"
import {
  cambiarEstadoOperador,
  crearOperador as crear,
  editarOperador as editar,
  listarOperadores as listar,
} from "./operadores.service"
import type { ActionState } from "./operadores.types"

const RUTA = "/admin/operadores"

function errorDeBaseDeDatos(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return "Ya existe un operador con ese tipo y número de documento."
  }
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    return "El operador ya no existe o fue actualizado por otra persona."
  }
  return "No se pudo completar la operación. Inténtalo nuevamente."
}

function leerFormulario(formData: FormData) {
  return {
    tipoDocumento: formData.get("tipoDocumento"),
    numeroDocumento: formData.get("numeroDocumento"),
    nombres: formData.get("nombres"),
    apellidos: formData.get("apellidos"),
    telefono: formData.get("telefono"),
    licencia: formData.get("licencia"),
    observaciones: formData.get("observaciones"),
  }
}

export async function listarOperadores(filtros: {
  busqueda?: string
  estado?: "todos" | "activos" | "inactivos"
  pagina?: number
  porPagina?: number
}) {
  await requerirSesion()
  try {
    return { success: true as const, data: await listar(filtros) }
  } catch (error) {
    console.error("Error al listar operadores:", error)
    return {
      success: false as const,
      error: "No se pudo cargar el listado de operadores.",
    }
  }
}

export async function crearOperador(
  _previo: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requerirSesion()
  const parsed = operadorSchema.safeParse(leerFormulario(formData))
  if (!parsed.success)
    return {
      success: false,
      message: "Revisa los campos indicados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  try {
    await crear(parsed.data)
    revalidatePath(RUTA)
    return { success: true, message: "Operador registrado correctamente." }
  } catch (error) {
    if (error instanceof ZodError)
      return {
        success: false,
        message: error.issues[0]?.message ?? "Datos no válidos.",
      }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      return { success: false, message: errorDeBaseDeDatos(error) }
    console.error("Error al crear operador:", error)
    return { success: false, message: errorDeBaseDeDatos(error) }
  }
}

export async function editarOperador(
  id: string,
  _previo: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requerirSesion()
  if (!id || id.length > 30)
    return {
      success: false,
      message: "El identificador del operador no es válido.",
    }
  const parsed = operadorSchema.safeParse(leerFormulario(formData))
  if (!parsed.success)
    return {
      success: false,
      message: "Revisa los campos indicados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  try {
    await editar(id, parsed.data)
    revalidatePath(RUTA)
    return { success: true, message: "Operador actualizado correctamente." }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      return { success: false, message: errorDeBaseDeDatos(error) }
    console.error("Error al editar operador:", error)
    return { success: false, message: errorDeBaseDeDatos(error) }
  }
}

export async function alternarEstadoOperador(id: string, activo: boolean) {
  await requerirSesion()
  if (!id || id.length > 30 || typeof activo !== "boolean")
    return { success: false as const, error: "La solicitud no es válida." }
  try {
    await cambiarEstadoOperador(id, activo)
    revalidatePath(RUTA)
    return { success: true as const }
  } catch (error) {
    console.error("Error al cambiar el estado del operador:", error)
    return { success: false as const, error: errorDeBaseDeDatos(error) }
  }
}
