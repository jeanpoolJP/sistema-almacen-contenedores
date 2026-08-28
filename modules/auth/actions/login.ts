"use server"

import bcrypt from "bcryptjs"

import { obtenerUsuarioAuth } from "../lib/auth"
import { crearSesion } from "../lib/session"

export async function loginAction(
  password: string
): Promise<{ error?: string }> {
  if (!password) {
    return {
      error: "Ingresa la contraseña.",
    }
  }

  const usuario = await obtenerUsuarioAuth()

  if (!usuario) {
    return {
      error: "El usuario de acceso no está configurado.",
    }
  }

  const passwordValida = await bcrypt.compare(password, usuario.passwordHash)

  if (!passwordValida) {
    return {
      error: "Contraseña incorrecta.",
    }
  }

  await crearSesion()

  return {}
}
