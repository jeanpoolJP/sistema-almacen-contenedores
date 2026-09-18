// modules\trasegados\components\detalle-guia\detalle-salidas.tsx

"use client"

import { TruckIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatDateTime } from "@/lib/date/format"

import type { GuiaTrasegadoSalidaDetalle } from "../../types/guia-trasegado-detalle.types"

interface DetalleSalidasProps {
  salidas: GuiaTrasegadoSalidaDetalle[]
}

export function DetalleSalidas({ salidas }: DetalleSalidasProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Salidas
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({salidas.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {salidas.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Aún no hay salidas registradas para esta guía.
          </p>
        ) : (
          <div className="space-y-4">
            {salidas.map((s, idx) => (
              <SalidaItem key={s.id} salida={s} index={idx} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SalidaItem({
  salida,
  index,
}: {
  salida: GuiaTrasegadoSalidaDetalle
  index: number
}) {
  return (
    <div className="rounded-lg border">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <TruckIcon className="size-4" />
          </div>
          <div>
            <p className="text-sm font-medium">
              Salida #{index + 1} · {formatDateTime(salida.fechaSalida)}
            </p>
            <p className="text-xs text-muted-foreground">
              {salida.empresaTransporte.nombre}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="font-mono text-xs">
          {salida.vehiculo.placa}
        </Badge>
      </div>

      <div className="grid gap-4 p-4 md:grid-cols-2">
        <div className="space-y-1 text-sm">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Empresa
          </p>
          <p>{salida.empresaTransporte.nombre}</p>
          <p className="text-xs text-muted-foreground">
            RUC: {salida.empresaTransporte.ruc}
          </p>
        </div>
        <div className="space-y-1 text-sm">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Conductor
          </p>
          <p>{salida.conductor.nombreCompleto}</p>
        </div>
      </div>

      <Separator />

      <div className="p-4">
        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Elementos retirados
        </p>
        <div className="flex flex-wrap gap-2">
          {salida.elementos.map((el) => (
            <Badge
              key={el.elementoId}
              variant="secondary"
              className="font-normal"
            >
              {el.tipo}
              {el.numero ? ` · ${el.numero}` : ""}
            </Badge>
          ))}
        </div>
      </div>

      {salida.observaciones && (
        <div className="border-t bg-muted/20 px-4 py-3">
          <p className="text-xs font-medium text-muted-foreground">
            Observaciones
          </p>
          <p className="mt-1 text-sm">{salida.observaciones}</p>
        </div>
      )}
    </div>
  )
}
