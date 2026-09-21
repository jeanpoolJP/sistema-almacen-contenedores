// modules\trasegados\components\detalle-guia\detalle-guia-trasegado-view.tsx

"use client"

import { useQuery } from "@tanstack/react-query"
import { Loader2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Separator } from "@/components/ui/separator"

import { DetalleHeader } from "./detalle-header"
import { DetalleInfoGeneral } from "./detalle-info-general"
import { DetalleIngreso } from "./detalle-ingreso"
import { DetalleElementos } from "./detalle-elementos"
import { DetalleSalidas } from "./detalle-salidas"
import { obtenerGuiaTrasegadoAction } from "../../actions/obtener-guia-trasegado.action"
import { exportarGuiaTrasegadoPDF } from "../utils/exportar-guia-pdf"
import type { GuiaTrasegadoDetalle } from "../../types/guia-trasegado-detalle.types"

interface DetalleGuiaTrasegadoViewProps {
  guiaId: number
}

export function DetalleGuiaTrasegadoView({
  guiaId,
}: DetalleGuiaTrasegadoViewProps) {
  const [exportando, setExportando] = useState(false)

  const { data, isLoading, error, refetch } = useQuery<GuiaTrasegadoDetalle>({
    queryKey: ["guia-trasegado", guiaId],
    queryFn: async () => {
      const res = await obtenerGuiaTrasegadoAction(guiaId)
      if (!res.success) throw new Error(res.message)
      return res.data
    },
  })

  const handleExportar = async () => {
    if (!data) return
    setExportando(true)
    try {
      await exportarGuiaTrasegadoPDF(data)
      toast.success("PDF generado correctamente.")
    } catch (e) {
      console.error(e)
      toast.error("No se pudo generar el PDF.")
    } finally {
      setExportando(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Error al cargar."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DetalleHeader
        guia={data}
        exportando={exportando}
        onExportar={handleExportar}
        onUpdated={refetch}
      />

      <DetalleInfoGeneral guia={data} />

      <DetalleIngreso guia={data} />

      {data.ingreso && (
        <DetalleElementos
          elementos={data.ingreso.elementos}
          guiaTrasegadoId={data.id}
          onUpdated={refetch}
        />
      )}

      <DetalleSalidas salidas={data.salidas} />
    </div>
  )
}
