"use server"

import { cerrarSesion } from "../lib/session"

export async function logoutAction() {
  await cerrarSesion()
}
