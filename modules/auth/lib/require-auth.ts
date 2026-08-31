// modules/auth/lib/require-auth.ts

import { obtenerSesion } from "./session"

export async function requerirSesion() {
  const sesion = await obtenerSesion()

  if (!sesion) {
    throw new Error("No autorizado")
  }

  return sesion
}
