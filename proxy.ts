import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const COOKIE_NAME = "auth_session"

const secret = new TextEncoder().encode(process.env.AUTH_SECRET)

async function verificarSesion(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    return false
  }

  try {
    const { payload } = await jwtVerify(token, secret)

    return payload.authenticated === true
  } catch {
    return false
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ============================================================
  // PÁGINA DE LOGIN
  // ============================================================

  if (pathname === "/") {
    const autenticado = await verificarSesion(request)

    // Si ya inició sesión, no tiene sentido mostrarle el login
    if (autenticado) {
      return NextResponse.redirect(new URL("/admin", request.url))
    }

    return NextResponse.next()
  }

  // ============================================================
  // RUTAS DEL SISTEMA
  // ============================================================

  if (pathname.startsWith("/admin")) {
    const autenticado = await verificarSesion(request)

    if (!autenticado) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/admin/:path*"],
}
