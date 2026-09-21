// modules\trasegados\components\finalizar-guia\pendientes-lista.tsx

"use client"

import {
  AlertTriangleIcon,
  BoxIcon,
  ContainerIcon,
  PackageIcon,
  WrenchIcon,
} from "lucide-react"

import type { ElementoPendienteSalida } from "../../types/registrar-salida.types"

interface PendientesListaProps {
  pendientes: ElementoPendienteSalida[]
}

const ICONOS: Record<ElementoPendienteSalida["tipo"], React.ReactNode> = {
  CONTENEDOR: <ContainerIcon className="size-4" />,
  FLAT_RACK: <BoxIcon className="size-4" />,
  MERCADERIA: <PackageIcon className="size-4" />,
  MAQUINARIA: <WrenchIcon className="size-4" />,
  OTRO: <PackageIcon className="size-4" />,
}

const ETIQUETAS: Record<ElementoPendienteSalida["tipo"], string> = {
  CONTENEDOR: "Contenedor",
  FLAT_RACK: "Flat Rack",
  MERCADERIA: "Mercadería",
  MAQUINARIA: "Maquinaria",
  OTRO: "Otro",
}

/**
 * Lista los elementos que impiden finalizar la guía.
 */
export function PendientesLista({ pendientes }: PendientesListaProps) {
  if (pendientes.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
        <p>
          No puedes finalizar la guía porque hay{" "}
          <strong>{pendientes.length}</strong>{" "}
          {pendientes.length === 1
            ? "elemento pendiente"
            : "elementos pendientes"}{" "}
          de retiro.
        </p>
      </div>

      <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border p-2">
        {pendientes.map((el) => (
          <div
            key={el.id}
            className="flex items-center gap-3 rounded-md bg-muted/40 p-2"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded bg-background text-muted-foreground">
              {ICONOS[el.tipo]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">
                  {ETIQUETAS[el.tipo]}
                </span>
                {el.numero && (
                  <span className="font-mono text-xs text-muted-foreground">
                    {el.numero}
                  </span>
                )}
              </div>
              {el.descripcion && (
                <p className="truncate text-xs text-muted-foreground">
                  {el.descripcion}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {pendientes.some((e) => e.tipo === "MERCADERIA") && (
        <p className="text-xs text-muted-foreground">
          La mercadería se considera pendiente hasta que la marques como
          completada desde el detalle de la guía.
        </p>
      )}
    </div>
  )
}
