// modules\trasegados\components\detalle-guia\detalle-elemento-card.tsx

"use client"

import { BoxIcon, ContainerIcon, PackageIcon, WrenchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import type { GuiaTrasegadoElementoDetalle } from "../../types/guia-trasegado-detalle.types"

interface DetalleElementoCardProps {
  elemento: GuiaTrasegadoElementoDetalle
  index: number
}

const ICONOS: Record<GuiaTrasegadoElementoDetalle["tipo"], React.ReactNode> = {
  CONTENEDOR: <ContainerIcon className="size-4" />,
  FLAT_RACK: <BoxIcon className="size-4" />,
  MERCADERIA: <PackageIcon className="size-4" />,
  MAQUINARIA: <WrenchIcon className="size-4" />,
  OTRO: <PackageIcon className="size-4" />,
}

const ETIQUETAS: Record<GuiaTrasegadoElementoDetalle["tipo"], string> = {
  CONTENEDOR: "Contenedor",
  FLAT_RACK: "Flat Rack",
  MERCADERIA: "Mercadería",
  MAQUINARIA: "Maquinaria",
  OTRO: "Otro",
}

export function DetalleElementoCard({
  elemento,
  index,
}: DetalleElementoCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/30 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              {ICONOS[elemento.tipo]}
            </div>
            <div>
              <CardTitle className="text-sm">
                {ETIQUETAS[elemento.tipo]} #{index + 1}
              </CardTitle>
              {elemento.numero && (
                <p className="font-mono text-xs text-muted-foreground">
                  {elemento.numero}
                </p>
              )}
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "font-medium",
              elemento.retirado
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            )}
          >
            {elemento.retirado ? "Retirado" : "Pendiente"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Datos específicos según tipo */}
        {elemento.tipo === "CONTENEDOR" && elemento.contenedor && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field
              label="Número"
              value={elemento.contenedor.numeroContenedor}
              mono
            />
            <Field label="Marca" value={elemento.contenedor.marca} />
            <Field
              label="Medida"
              value={`${elemento.contenedor.medida} pies`}
            />
            <Field
              label="Tipo"
              value={
                elemento.contenedor.tipo === "REEFER" ? "Reefer" : "Normal"
              }
            />
          </div>
        )}

        {elemento.tipo === "FLAT_RACK" && elemento.flatRack && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Número" value={elemento.flatRack.numero} mono />
            <Field label="Marca" value={elemento.flatRack.marca} />
          </div>
        )}

        {(elemento.tipo === "MERCADERIA" ||
          elemento.tipo === "MAQUINARIA" ||
          elemento.tipo === "OTRO") && (
          <div className="grid gap-4 sm:grid-cols-2">
            {elemento.numero && (
              <Field label="Número" value={elemento.numero} mono />
            )}
            {elemento.descripcion && (
              <Field label="Descripción" value={elemento.descripcion} />
            )}
          </div>
        )}

        {/* Observaciones comunes a todos los tipos */}
        {elemento.observaciones && (
          <div className="rounded-md border bg-muted/20 p-3">
            <p className="text-xs font-medium text-muted-foreground">
              Observaciones
            </p>
            <p className="mt-1 text-sm whitespace-pre-wrap">
              {elemento.observaciones}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function Field({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className={cn("text-sm", mono && "font-mono")}>{value}</p>
    </div>
  )
}
