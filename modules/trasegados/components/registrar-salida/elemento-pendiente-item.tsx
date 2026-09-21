// modules\trasegados\components\registrar-salida\elemento-pendiente-item.tsx

"use client"

import { BoxIcon, ContainerIcon, PackageIcon, WrenchIcon } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

import type { ElementoPendienteSalida } from "../../types/registrar-salida.types"

interface ElementoPendienteItemProps {
  elemento: ElementoPendienteSalida
  seleccionado: boolean
  onToggle: () => void
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

export function ElementoPendienteItem({
  elemento,
  seleccionado,
  onToggle,
}: ElementoPendienteItemProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors",
        seleccionado ? "border-primary/40 bg-primary/5" : "hover:bg-muted/40"
      )}
    >
      <Checkbox
        checked={seleccionado}
        onCheckedChange={onToggle}
        className="mt-0.5"
      />

      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {ICONOS[elemento.tipo]}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">
            {ETIQUETAS[elemento.tipo]}
          </span>
          {elemento.numero && (
            <span className="font-mono text-xs text-muted-foreground">
              {elemento.numero}
            </span>
          )}
        </div>

        {/* Dentro del bloque de título, junto al tipo */}
        {elemento.tipo === "MERCADERIA" && (
          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
            Puede salir por partes
          </span>
        )}

        {/* Detalle según tipo */}
        {elemento.contenedor && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-muted-foreground sm:grid-cols-4">
            <span>Marca: {elemento.contenedor.marca}</span>
            <span>Medida: {elemento.contenedor.medida} pies</span>
            <span>
              Tipo:{" "}
              {elemento.contenedor.tipo === "REEFER" ? "Reefer" : "Normal"}
            </span>
          </div>
        )}

        {elemento.flatRack && (
          <div className="text-xs text-muted-foreground">
            Marca: {elemento.flatRack.marca}
          </div>
        )}

        {elemento.descripcion && (
          <p className="text-xs text-muted-foreground">
            {elemento.descripcion}
          </p>
        )}

        {elemento.observaciones && (
          <p className="text-xs text-muted-foreground italic">
            {elemento.observaciones}
          </p>
        )}
      </div>
    </label>
  )
}
