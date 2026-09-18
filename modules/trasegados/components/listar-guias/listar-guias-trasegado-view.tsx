// modules\trasegados\components\listar-guias\listar-guias-trasegado-view.tsx

"use client"

import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import Link from "next/link"

import { FiltrosGuiasTrasegado } from "./filtros-guias-trasegado"
import { TablaGuiasTrasegado } from "./tabla-guias-trasegado"
import { useListarGuiasTrasegado } from "../../hooks/use-listar-guias-trasegado"

export function ListarGuiasTrasegadoView() {
  const router = useRouter()

  const {
    filtros,
    result,
    isPending,
    actualizarFiltro,
    limpiarFiltros,
    irAPagina,
    cambiarOrden,
  } = useListarGuiasTrasegado()

  const handleVerDetalle = (id: number) => {
    router.push(`/admin/trasegados/${id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Guías de trasegado
          </h1>
          <p className="text-sm text-muted-foreground">
            Administra y consulta las guías registradas en el almacén.
          </p>
        </div>
        <Button>
          <Link href="/admin/trasegados/crear">
            <PlusIcon className="mr-2 size-4" />
            Nueva guía
          </Link>
        </Button>
      </div>

      <FiltrosGuiasTrasegado
        filtros={filtros}
        onChange={actualizarFiltro}
        onLimpiar={limpiarFiltros}
      />

      <TablaGuiasTrasegado
        result={result}
        isLoading={isPending && !result}
        onVerDetalle={handleVerDetalle}
        onIrAPagina={irAPagina}
        onCambiarOrden={cambiarOrden}
        ordenActual={filtros.ordenarPor ?? "fechaIngreso"}
      />
    </div>
  )
}
