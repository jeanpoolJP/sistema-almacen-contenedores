// modules/auth/lib/rate-limit.ts

type RateLimitEntry = {
  intentos: number
  ventanaHasta: number
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

  // No existe ningún registro para esta IP
  if (!registro) {
    return {
      permitido: true,
      intentosRestantes: MAX_INTENTOS,
    }
  }

  // ==========================================================
  // COMPROBAR BLOQUEO
  // ==========================================================

  if (registro.bloqueadoHasta > ahora) {
    return {
      permitido: false,
      intentosRestantes: 0,
    }
  }

  // ==========================================================
  // LA VENTANA DE INTENTOS YA TERMINÓ
  // ==========================================================

  if (registro.ventanaHasta <= ahora) {
    intentos.delete(ip)

    return {
      permitido: true,
      intentosRestantes: MAX_INTENTOS,
    }
  }

  // ==========================================================
  // TODAVÍA ESTAMOS DENTRO DE LA VENTANA
  // ==========================================================

  return {
    permitido: true,
    intentosRestantes: Math.max(
      0,
      MAX_INTENTOS - registro.intentos
    ),
  }
}

/**
 * Registra un intento fallido.
 */
export function registrarIntentoFallido(ip: string) {
  const ahora = Date.now()

  const registro = intentos.get(ip)

  // ==========================================================
  // PRIMER INTENTO FALLIDO
  // ==========================================================

  if (!registro) {
    intentos.set(ip, {
      intentos: 1,
      ventanaHasta: ahora + VENTANA_MS,
      bloqueadoHasta: 0,
    })

    return
  }

  // ==========================================================
  // LA VENTANA ANTERIOR YA TERMINÓ
  // ==========================================================

  if (registro.ventanaHasta <= ahora) {
    intentos.set(ip, {
      intentos: 1,
      ventanaHasta: ahora + VENTANA_MS,
      bloqueadoHasta: 0,
    })

    return
  }

  // ==========================================================
  // INCREMENTAR INTENTOS
  // ==========================================================

  registro.intentos += 1

  // ==========================================================
  // BLOQUEAR AL LLEGAR AL MÁXIMO
  // ==========================================================

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
