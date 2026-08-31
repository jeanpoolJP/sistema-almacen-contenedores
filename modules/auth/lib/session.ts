// modules/auth/lib/session.ts

import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

const COOKIE_NAME = "auth_session"

const AUTH_ISSUER = "almacen-contenedores"
const AUTH_AUDIENCE = "admin"

const AUTH_SECRET = process.env.AUTH_SECRET

if (!AUTH_SECRET) {
  throw new Error(
    "AUTH_SECRET no está configurado. Configura esta variable de entorno."
  )
}

if (AUTH_SECRET.length < 12) {
  throw new Error("AUTH_SECRET debe tener al menos 12 caracteres.")
}

const secret = new TextEncoder().encode(AUTH_SECRET)

const SESSION_DURATION = 60 * 60 * 8 // 8 horas

/**
 * ============================================================
 * CREAR SESIÓN
 * ============================================================
 */

export async function crearSesion(usuarioId: number) {
  const token = await new SignJWT({
    authenticated: true,
  })
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT",
    })
    .setSubject(usuarioId.toString())
    .setIssuer(AUTH_ISSUER)
    .setAudience(AUTH_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(secret)

  const cookieStore = await cookies()

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,

    secure: process.env.NODE_ENV === "production",

    sameSite: "lax",

    path: "/",

    maxAge: SESSION_DURATION,

    priority: "high",
  })
}

/**
 * ============================================================
 * CERRAR SESIÓN
 * ============================================================
 */

export async function cerrarSesion() {
  const cookieStore = await cookies()

  cookieStore.delete(COOKIE_NAME)
}

/**
 * ============================================================
 * OBTENER SESIÓN
 * ============================================================
 */

export async function obtenerSesion() {
  const cookieStore = await cookies()

  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
      issuer: AUTH_ISSUER,
      audience: AUTH_AUDIENCE,
    })

    if (payload.authenticated !== true) {
      return null
    }

    if (!payload.sub) {
      return null
    }

    return {
      usuarioId: Number(payload.sub),
      authenticated: true,
    }
  } catch {
    return null
  }
}
