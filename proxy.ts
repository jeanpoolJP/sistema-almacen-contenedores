// proxy.ts

import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const COOKIE_NAME = "auth_session"

const AUTH_ISSUER = "almacen-contenedores"
const AUTH_AUDIENCE = "admin"

const AUTH_SECRET = process.env.AUTH_SECRET

if (!AUTH_SECRET) {
  throw new Error("AUTH_SECRET no está configurado.")
}

if (AUTH_SECRET.length < 12) {
  throw new Error("AUTH_SECRET debe tener al menos 12 caracteres.")
}

const secret = new TextEncoder().encode(AUTH_SECRET)

/**
 * ============================================================
 * VERIFICAR SESIÓN
 * ============================================================
 */

async function verificarSesion(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    return false
  }

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
      issuer: AUTH_ISSUER,
      audience: AUTH_AUDIENCE,
    })

    if (payload.authenticated !== true) {
      return false
    }

    if (!payload.sub) {
      return false
    }

    return true
  } catch {
    return false
  }
}

/**
 * ============================================================
 * PROXY
 * ============================================================
 */

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const autenticado = await verificarSesion(request)

  /**
   * ----------------------------------------------------------
   * LOGIN
   * ----------------------------------------------------------
   */

  if (pathname === "/") {
    if (autenticado) {
      return NextResponse.redirect(new URL("/admin", request.url))
    }

    return NextResponse.next()
  }

  /**
   * ----------------------------------------------------------
   * ADMIN
   * ----------------------------------------------------------
   */

  if (pathname.startsWith("/admin")) {
    if (!autenticado) {
      const loginUrl = new URL("/", request.url)

      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

/**
 * ============================================================
 * MATCHER
 * ============================================================
 */

export const config = {
  matcher: ["/", "/admin/:path*"],
}
