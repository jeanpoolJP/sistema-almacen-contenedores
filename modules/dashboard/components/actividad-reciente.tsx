"use client"

import { ArrowDownToLine, ArrowUpFromLine, Container } from "lucide-react"

import type { ActividadReciente } from "../dashboard.types"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"

type ActividadRecienteProps = {
  actividades: ActividadReciente[]
}

function formatFecha(fecha: string) {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(fecha))
}

export function ActividadReciente({ actividades }: ActividadRecienteProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad reciente</CardTitle>
      </CardHeader>

      <CardContent>
        {actividades.length === 0 ? (
          <div className="py-8 text-center">
            <Container className="mx-auto size-8 text-muted-foreground" />

            <p className="mt-3 text-sm font-medium">
              No hay actividad registrada.
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Las operaciones recientes aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {actividades.map((actividad) => {
              const esSalida = actividad.tipo === "SALIDA"

              return (
                <div key={actividad.id} className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    {esSalida ? (
                      <ArrowUpFromLine className="size-4 text-muted-foreground" />
                    ) : (
                      <ArrowDownToLine className="size-4 text-muted-foreground" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">Guía {actividad.numeroGuia}</p>

                      <Badge variant={esSalida ? "secondary" : "default"}>
                        {esSalida ? "Salida" : "Ingreso"}
                      </Badge>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {actividad.numeroContenedor} · {actividad.marcaContenedor}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {actividad.cliente}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatFecha(actividad.fecha)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
