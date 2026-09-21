// modules\trasegados\components\registrar-salida\seccion-elementos-pendientes.tsx

"use client"

import { InboxIcon, Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { ElementoPendienteItem } from "./elemento-pendiente-item"
import type { ElementoPendienteSalida } from "../../types/registrar-salida.types"

interface SeccionElementosPendientesProps {
  elementos: ElementoPendienteSalida[]
  cargando: boolean
  seleccionados: Set<number>
  onToggle: (id: number) => void
  onSeleccionarTodos: () => void
  onLimpiarSeleccion: () => void
  errorMessage?: string
}

export function SeccionElementosPendientes({
  elementos,
  cargando,
  seleccionados,
  onToggle,
  onSeleccionarTodos,
  onLimpiarSeleccion,
  errorMessage,
}: SeccionElementosPendientesProps) {
  const total = elementos.length
  const seleccionCount = seleccionados.size

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Elementos a retirar</CardTitle>
          <CardDescription>
            {total > 0
              ? `${seleccionCount} de ${total} seleccionados`
              : "No hay elementos pendientes de retiro."}
          </CardDescription>
        </div>

        {total > 0 && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onSeleccionarTodos}
              disabled={seleccionCount === total}
            >
              Seleccionar todos
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onLimpiarSeleccion}
              disabled={seleccionCount === 0}
            >
              Limpiar
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {cargando ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/20 py-10 text-center">
            <InboxIcon className="size-8 text-muted-foreground/60" />
            <p className="text-sm font-medium">Sin elementos pendientes</p>
            <p className="text-xs text-muted-foreground">
              Todos los elementos del ingreso ya fueron retirados.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {elementos.map((el) => (
              <ElementoPendienteItem
                key={el.id}
                elemento={el}
                seleccionado={seleccionados.has(el.id)}
                onToggle={() => onToggle(el.id)}
              />
            ))}

            {elementos.some((e) => e.tipo === "MERCADERIA") && (
              <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
                <strong>Nota:</strong> la mercadería puede retirarse por partes
                en distintas salidas. Márcala como completada desde el detalle
                de la guía cuando confirmes que ya no queda nada por retirar.
              </div>
            )}
          </div>
        )}

        {errorMessage && (
          <p className="mt-3 text-sm font-medium text-destructive">
            {errorMessage}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
