// app\admin\liquidaciones\[id]\page.tsx

import { notFound } from "next/navigation"
import { liquidacionService } from "@/modules/liquidaciones/liquidacion.service"
import { LiquidacionDetalleView } from "@/modules/liquidaciones/components/liquidacion-detalle"
import { LiquidacionError } from "@/modules/liquidaciones/liquidacion.errors"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  try {
    const liq = await liquidacionService.getById(Number(id))
    return <LiquidacionDetalleView liquidacion={liq} />
  } catch (err) {
    if (err instanceof LiquidacionError && err.code === "NOT_FOUND") notFound()
    throw err
  }
}
