// modules/auth/lib/rate-limit.ts

type RateLimitEntry = {
  intentos: number
  bloqueadoHasta: number
}

const intentos = new Map<string, RateLimitEntry>()

const MAX_INTENTOS = 5

const VENTANA_MS = 15 * 60 * 1000 // 15 minutos

const BLOQUEO_MS = 15 * 60 * 1000 // 15 minutos

/**
 * Comprueba si una IP puede intentar iniciar sesión.
 */
export function puedeIntentarLogin(ip: string) {
  const ahora = Date.now()

  const registro = intentos.get(ip)

  if (!registro) {
    return {
      permitido: true,
      intentosRestantes: MAX_INTENTOS,
    }
  }

  if (registro.bloqueadoHasta > ahora) {
    return {
      permitido: false,
      intentosRestantes: 0,
    }
  }

  if (ahora - registro.bloqueadoHasta >= VENTANA_MS) {
    intentos.delete(ip)

    return {
      permitido: true,
      intentosRestantes: MAX_INTENTOS,
    }
  }

  return {
    permitido: true,
    intentosRestantes: Math.max(0, MAX_INTENTOS - registro.intentos),
  }
}

/**
 * Registra un intento fallido.
 */
export function registrarIntentoFallido(ip: string) {
  const ahora = Date.now()

  const registro = intentos.get(ip)

  if (!registro) {
    intentos.set(ip, {
      intentos: 1,
      bloqueadoHasta: ahora + VENTANA_MS,
    })

    return
  }

  registro.intentos += 1

  if (registro.intentos >= MAX_INTENTOS) {
    registro.bloqueadoHasta = ahora + BLOQUEO_MS
  }

  intentos.set(ip, registro)
}

/**
 * Limpia los intentos después de un login exitoso.
 */
export function limpiarIntentos(ip: string) {
  intentos.delete(ip)
}
