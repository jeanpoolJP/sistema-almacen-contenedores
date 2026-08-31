// modules\auth\actions\logout.ts

"use server"

import { cerrarSesion } from "../lib/session"

export async function logoutAction() {
  await cerrarSesion()
}
