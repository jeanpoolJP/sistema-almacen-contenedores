"use server"

import { EstadoEquipo, Prisma } from "@/lib/generated/prisma/client"
import { revalidatePath } from "next/cache"
import { requerirSesion } from "@/modules/auth/lib/require-auth"

import { equipoSchema } from "./equipos.schema"
import {
  cambiarEstadoEquipo as cambiarEstado,
  crearEquipo as crear,
  editarEquipo as editar,
  listarEquipos as listar,
} from "./equipos.service"
import type { EquipoActionState } from "./equipos.types"

const RUTA = "/admin/equipos"

function leerFormulario(formData: FormData) {
  return {
    codigo: formData.get("codigo") ?? "",
    nombre: formData.get("nombre") ?? "",
    tipo: formData.get("tipo") ?? "",
    marca: formData.get("marca") ?? "",
    modelo: formData.get("modelo") ?? "",
    placa: formData.get("placa") ?? "",
    capacidadCarga: formData.get("capacidadCarga") ?? "",
    estado: formData.get("estado") ?? "",
    observaciones: formData.get("observaciones") ?? "",
  }
}

function mensajeError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return "Ya existe un equipo con ese código."
    if (error.code === "P2025") return "El equipo no existe o fue actualizado."
  }
  return "No se pudo completar la operación. Inténtalo nuevamente."
}

export async function listarEquipos(filtros: {
  busqueda?: string
  tipo?: "todos" | "MONTACARGAS" | "STACKER" | "OTRO"
  estado?: "todos" | "DISPONIBLE" | "EN_REPARACION" | "INOPERATIVO"
  pagina?: number
  porPagina?: number
}) {
  await requerirSesion()

  try {
    return { success: true as const, data: await listar(filtros) }
  } catch (error) {
    console.error("Error al listar equipos:", error)
    return {
      success: false as const,
      error: "No se pudo cargar el listado de equipos.",
    }
  }
}

export async function crearEquipo(
  _previo: EquipoActionState,
  formData: FormData
): Promise<EquipoActionState> {
  await requerirSesion()
  const resultado = equipoSchema.safeParse(leerFormulario(formData))

  if (!resultado.success) {
    return {
      success: false,
      message: "Revisa los campos indicados.",
      fieldErrors: resultado.error.flatten().fieldErrors,
    }
  }

  try {
    await crear(resultado.data)
    revalidatePath(RUTA)
    return { success: true, message: "Equipo registrado correctamente." }
  } catch (error) {
    console.error("Error al crear equipo:", error)
    return { success: false, message: mensajeError(error) }
  }
}

export async function editarEquipo(
  id: string,
  _previo: EquipoActionState,
  formData: FormData
): Promise<EquipoActionState> {
  await requerirSesion()
  if (!id || id.length > 30) {
    return {
      success: false,
      message: "El identificador del equipo no es válido.",
    }
  }

  const resultado = equipoSchema.safeParse(leerFormulario(formData))
  if (!resultado.success) {
    return {
      success: false,
      message: "Revisa los campos indicados.",
      fieldErrors: resultado.error.flatten().fieldErrors,
    }
  }

  try {
    await editar(id, resultado.data)
    revalidatePath(RUTA)
    return { success: true, message: "Equipo actualizado correctamente." }
  } catch (error) {
    console.error("Error al editar equipo:", error)
    return { success: false, message: mensajeError(error) }
  }
}

export async function cambiarEstadoEquipo(id: string, estado: EstadoEquipo) {
  await requerirSesion()
  if (!id || id.length > 30 || !Object.values(EstadoEquipo).includes(estado)) {
    return { success: false as const, error: "La solicitud no es válida." }
  }

  try {
    await cambiarEstado(id, estado)
    revalidatePath(RUTA)
    return { success: true as const }
  } catch (error) {
    console.error("Error al cambiar el estado del equipo:", error)
    return { success: false as const, error: mensajeError(error) }
  }
}
