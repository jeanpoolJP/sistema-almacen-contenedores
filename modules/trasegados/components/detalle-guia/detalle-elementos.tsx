// modules\trasegados\components\detalle-guia\detalle-elementos.tsx

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { DetalleElementoCard } from "./detalle-elemento-card"
import type { GuiaTrasegadoElementoDetalle } from "../../types/guia-trasegado-detalle.types"

interface DetalleElementosProps {
  elementos: GuiaTrasegadoElementoDetalle[]
  guiaTrasegadoId: number
  onUpdated?: () => void
}

export function DetalleElementos({
  elementos,
  guiaTrasegadoId,
  onUpdated,
}: DetalleElementosProps) {
  if (elementos.length === 0) return null

  const pendientes = elementos.filter((e) => !e.retirado).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Elementos transportados
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({elementos.length} en total · {pendientes} pendientes)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {elementos.map((el, i) => (
          <DetalleElementoCard
            key={el.id}
            elemento={el}
            guiaTrasegadoId={guiaTrasegadoId}
            index={i}
            onUpdated={onUpdated}
          />
        ))}
      </CardContent>
    </Card>
  )
}
