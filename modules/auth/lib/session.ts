import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

const COOKIE_NAME = "auth_session"

const secret = new TextEncoder().encode(process.env.AUTH_SECRET)

export async function crearSesion() {
  const token = await new SignJWT({
    authenticated: true,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret)

  const cookieStore = await cookies()

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  })
}

export async function cerrarSesion() {
  const cookieStore = await cookies()

  cookieStore.delete(COOKIE_NAME)
}

export async function obtenerSesion() {
  const cookieStore = await cookies()

  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token, secret)

    if (payload.authenticated !== true) {
      return null
    }

    return payload
  } catch {
    return null
  }
}
