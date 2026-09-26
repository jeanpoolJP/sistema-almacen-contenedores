// modules\liquidaciones\liquidacion.result.ts

import { LiquidacionError } from "./liquidacion.errors"

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } }

export async function toActionResult<T>(
  fn: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const data = await fn()
    return { ok: true, data }
  } catch (err) {
    if (err instanceof LiquidacionError) {
      return { ok: false, error: { code: err.code, message: err.message } }
    }
    console.error("[liquidacion] unexpected error:", err)
    return {
      ok: false,
      error: { code: "UNKNOWN", message: "Error inesperado en el servidor" },
    }
  }
}
