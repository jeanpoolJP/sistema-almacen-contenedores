// modules\trasegados\components\detalle-guia\detalle-header.tsx

"use client"

import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  DownloadIcon,
  Loader2Icon,
  RotateCcwIcon,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { EstadoBadge, EstadoPagoBadge } from "../listar-guias/estado-badge"
import { FinalizarGuiaModal } from "../finalizar-guia"
import type { GuiaTrasegadoDetalle } from "../../types/guia-trasegado-detalle.types"

interface DetalleHeaderProps {
  guia: GuiaTrasegadoDetalle
  exportando: boolean
  onExportar: () => void
  onUpdated?: () => void
}

export function DetalleHeader({
  guia,
  exportando,
  onExportar,
  onUpdated,
}: DetalleHeaderProps) {
  const [modal, setModal] = useState<{ open: boolean; finalizar: boolean }>({
    open: false,
    finalizar: true,
  })

  const enProceso = guia.estado === "EN_PROCESO"

  return (
    <>
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

        <div className="flex gap-2">
          {enProceso ? (
            <Button
              type="button"
              variant="default"
              onClick={() => setModal({ open: true, finalizar: true })}
            >
              <CheckCircle2Icon className="mr-2 size-4" />
              Finalizar guía
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setModal({ open: true, finalizar: false })}
            >
              <RotateCcwIcon className="mr-2 size-4" />
              Reactivar guía
            </Button>
          )}

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
      </div>

      <FinalizarGuiaModal
        open={modal.open}
        onOpenChange={(open) => setModal((prev) => ({ ...prev, open }))}
        guiaId={guia.id}
        numeroGuia={guia.numeroGuia}
        finalizar={modal.finalizar}
        onSuccess={onUpdated}
      />
    </>
  )
}
