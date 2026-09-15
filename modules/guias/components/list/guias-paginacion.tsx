// modules/guias/components/list/guias-paginacion.tsx

"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type GuiasPaginacionProps = {
  pagina: number
  totalPaginas: number
  limite: number
  onCambiarPagina: (pagina: number) => void
  onCambiarLimite: (limite: string | null) => void
  deshabilitado: boolean
}

export function GuiasPaginacion({
  pagina,
  totalPaginas,
  limite,
  onCambiarPagina,
  onCambiarLimite,
  deshabilitado,
}: GuiasPaginacionProps) {
  if (totalPaginas <= 0) return null

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* REGISTROS POR PÁGINA */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Mostrar</span>
        <Select
          value={String(limite)}
          onValueChange={onCambiarLimite}
          disabled={deshabilitado}
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
        <span>por página</span>
      </div>

      {/* NAVEGACIÓN */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={pagina === 1 || deshabilitado}
          onClick={() => onCambiarPagina(pagina - 1)}
        >
          <ChevronLeft className="mr-1 size-4" />
          Anterior
        </Button>

        <span className="min-w-25 text-center text-sm">
          Página {pagina} de {totalPaginas}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={pagina === totalPaginas || deshabilitado}
          onClick={() => onCambiarPagina(pagina + 1)}
        >
          Siguiente
          <ChevronRight className="ml-1 size-4" />
        </Button>
      </div>
    </div>
  )
}
