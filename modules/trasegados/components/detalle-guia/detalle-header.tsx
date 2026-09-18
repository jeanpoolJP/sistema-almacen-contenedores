// modules\trasegados\components\detalle-guia\detalle-header.tsx

"use client"

import { ArrowLeftIcon, DownloadIcon, Loader2Icon } from "lucide-react"
import Link from "next/link"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { EstadoBadge, EstadoPagoBadge } from "../listar-guias/estado-badge"
import type { GuiaTrasegadoDetalle } from "../../types/guia-trasegado-detalle.types"

interface DetalleHeaderProps {
  guia: GuiaTrasegadoDetalle
  exportando: boolean
  onExportar: () => void
}

export function DetalleHeader({
  guia,
  exportando,
  onExportar,
}: DetalleHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/trasegados"
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
        >
          <ArrowLeftIcon className="size-4" />
        </Link>
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl font-bold tracking-tight">
              {guia.numeroGuia}
            </h1>
            <EstadoBadge estado={guia.estado} />
            <EstadoPagoBadge estadoPago={guia.estadoPago} />
          </div>
          {guia.descripcionServicio && (
            <p className="text-sm text-muted-foreground">
              {guia.descripcionServicio}
            </p>
          )}
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onExportar}
        disabled={exportando}
      >
        {exportando ? (
          <>
            <Loader2Icon className="mr-2 size-4 animate-spin" />
            Generando...
          </>
        ) : (
          <>
            <DownloadIcon className="mr-2 size-4" />
            Exportar PDF
          </>
        )}
      </Button>
    </div>
  )
}
