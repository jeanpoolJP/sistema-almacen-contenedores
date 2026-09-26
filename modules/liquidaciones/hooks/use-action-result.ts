// modules/liquidaciones/hooks/use-action-result.ts
"use client"

import { toast } from "sonner"
import type { ActionResult } from "../liquidacion.result"

export async function runAction<T>(
  fn: () => Promise<ActionResult<T>>,
  opts?: { successMessage?: string }
): Promise<T | null> {
  const res = await fn()
  if (!res.ok) {
    toast.error(res.error.message)
    return null
  }
  if (opts?.successMessage) toast.success(opts.successMessage)
  return res.data
}
