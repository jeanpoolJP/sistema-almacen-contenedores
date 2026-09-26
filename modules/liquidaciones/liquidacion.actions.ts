// modules/liquidaciones/liquidacion.actions.ts
"use server"

import { revalidatePath } from "next/cache"
import { liquidacionService } from "./liquidacion.service"
import { toActionResult } from "./liquidacion.result"
import type {
  GuiaDisponible,
  LiquidacionDetalle,
  LiquidacionListItem,
} from "./liquidacion.types"

type ListResult = {
  items: LiquidacionListItem[]
  total: number
  page: number
  pageSize: number
}

export async function listLiquidacionesAction(input: unknown) {
  return toActionResult<ListResult>(() => liquidacionService.list(input))
}

export async function getLiquidacionAction(id: number) {
  return toActionResult<LiquidacionDetalle>(() =>
    liquidacionService.getById(id)
  )
}

export async function getGuiasDisponiblesAction(clienteId: number) {
  return toActionResult<GuiaDisponible[]>(() =>
    liquidacionService.getGuiasDisponibles(clienteId)
  )
}

export async function createLiquidacionAction(input: unknown) {
  const result = await toActionResult<LiquidacionDetalle>(() =>
    liquidacionService.create(input)
  )
  if (result.ok) revalidatePath("/admin/liquidaciones")
  return result
}

export async function updateLiquidacionDetallesAction(input: unknown) {
  const liquidacionId = (input as { liquidacionId?: number })?.liquidacionId
  const result = await toActionResult<LiquidacionDetalle>(() =>
    liquidacionService.updateDetalles(input)
  )
  if (result.ok && liquidacionId) {
    revalidatePath(`/admin/liquidaciones/${liquidacionId}`)
  }
  return result
}

export async function confirmarLiquidacionAction(input: unknown) {
  const liquidacionId = (input as { liquidacionId?: number })?.liquidacionId
  const result = await toActionResult<LiquidacionDetalle>(() =>
    liquidacionService.confirmar(input)
  )
  if (result.ok) {
    revalidatePath("/admin/liquidaciones")
    if (liquidacionId) revalidatePath(`/admin/liquidaciones/${liquidacionId}`)
  }
  return result
}

export async function registrarPagoLiquidacionAction(input: unknown) {
  const result = await toActionResult<LiquidacionDetalle>(() =>
    liquidacionService.registrarPago(input)
  )
  if (result.ok) {
    revalidatePath("/admin/liquidaciones")
  }
  return result
}

export async function anularLiquidacionAction(id: number) {
  const result = await toActionResult<LiquidacionDetalle>(() =>
    liquidacionService.anular(id)
  )
  if (result.ok) revalidatePath("/admin/liquidaciones")
  return result
}
