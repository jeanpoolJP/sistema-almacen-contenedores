// modules/auth/actions/login.ts

"use server"

import bcrypt from "bcryptjs"
import { headers } from "next/headers"

import { obtenerUsuarioAuth } from "../lib/auth"
import { crearSesion } from "../lib/session"

import {
  puedeIntentarLogin,
  registrarIntentoFallido,
  limpiarIntentos,
} from "../lib/rate-limit"

/**
 * ============================================================
 * LOGIN
 * ============================================================
 */

export async function loginAction(
  password: string
): Promise<{ error?: string }> {
  /**
   * ----------------------------------------------------------
   * VALIDACIÓN BÁSICA
   * ----------------------------------------------------------
   */

  if (
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 128
  ) {
    return {
      error: "Credenciales incorrectas.",
    }
  }

  /**
   * ----------------------------------------------------------
   * OBTENER IP
   * ----------------------------------------------------------
   */

  const headerStore = await headers()

  const forwardedFor = headerStore.get("x-forwarded-for")

  const ip = forwardedFor?.split(",")[0]?.trim() ?? "unknown"

  /**
   * ----------------------------------------------------------
   * RATE LIMIT
   * ----------------------------------------------------------
   */

  const rateLimit = puedeIntentarLogin(ip)

  if (!rateLimit.permitido) {
    return {
      error: "Demasiados intentos. Intenta nuevamente más tarde.",
    }
  }

  /**
   * ----------------------------------------------------------
   * OBTENER USUARIO
   * ----------------------------------------------------------
   */

  const usuario = await obtenerUsuarioAuth()

  /**
   * ----------------------------------------------------------
   * COMPROBAR CONTRASEÑA
   * ----------------------------------------------------------
   */

  const passwordValida = usuario
    ? await bcrypt.compare(password, usuario.passwordHash)
    : false

  /**
   * ----------------------------------------------------------
   * CREDENCIALES INCORRECTAS
   * ----------------------------------------------------------
   */

  if (!usuario || !passwordValida) {
    registrarIntentoFallido(ip)

    console.warn("Intento de login fallido", {
      ip,
    })

    return {
      error: "Credenciales incorrectas.",
    }
  }

  /**
   * ----------------------------------------------------------
   * LOGIN CORRECTO
   * ----------------------------------------------------------
   */

  limpiarIntentos(ip)

  await crearSesion(usuario.id)

  return {}
}
