"use client"

import { CheckCircle2, Clock, XCircle } from "lucide-react"

import type { EstadoAlmacen } from "../dashboard.types"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type EstadoAlmacenProps = {
  estado: EstadoAlmacen
}

export function EstadoAlmacen({ estado }: EstadoAlmacenProps) {
  const porcentajeAlmacenados =
    estado.total > 0 ? (estado.almacenados / estado.total) * 100 : 0

  const porcentajeRetirados =
    estado.total > 0 ? (estado.retirados / estado.total) * 100 : 0

  const porcentajeAnulados =
    estado.total > 0 ? (estado.anulados / estado.total) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado del almacén</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Almacenados */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-muted-foreground" />

              <span className="text-sm font-medium">Almacenados</span>
            </div>

            <span className="text-sm font-semibold">{estado.almacenados}</span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${porcentajeAlmacenados}%`,
              }}
            />
          </div>
        </div>

        {/* Retirados */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />

              <span className="text-sm font-medium">Retirados</span>
            </div>

            <span className="text-sm font-semibold">{estado.retirados}</span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-muted-foreground transition-all"
              style={{
                width: `${porcentajeRetirados}%`,
              }}
            />
          </div>
        </div>

        {/* Anulados */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="size-4 text-muted-foreground" />

              <span className="text-sm font-medium">Anulados</span>
            </div>

            <span className="text-sm font-semibold">{estado.anulados}</span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-destructive transition-all"
              style={{
                width: `${porcentajeAnulados}%`,
              }}
            />
          </div>
        </div>

        {/* Total */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Total de operaciones
            </span>

            <span className="font-semibold">{estado.total}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
