// modules\inventario\components\inventario-actions.tsx

"use client"

import { FileSpreadsheet, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"

type InventarioActionsProps = {
  onExportar: () => void
  onImprimir: () => void
  onFinalizar?: () => void
  puedeFinalizar?: boolean
}

export function InventarioActions({
  onExportar,
  onImprimir,
  onFinalizar,
  puedeFinalizar = false,
}: InventarioActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={onExportar}>
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Exportar Excel
      </Button>

      <Button variant="outline" onClick={onImprimir}>
        <Printer className="mr-2 h-4 w-4" />
        Imprimir
      </Button>

      {onFinalizar && (
        <Button onClick={onFinalizar} disabled={!puedeFinalizar}>
          Finalizar inventario
        </Button>
      )}
    </div>
  )
}
