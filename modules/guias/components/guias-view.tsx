// modules/guias/components/guias-view.tsx

"use client"

import { useRouter } from "next/navigation"

import { CrearGuiaDialog } from "./crear-guia-dialog"
import { GuiasTable } from "./guias-table"
import type { GuiaConRelaciones } from "./guia-con-relaciones.type"

type GuiasViewProps = {
  data: {
    guias: GuiaConRelaciones[]
    total: number
    pagina: number
    limite: number
    totalPaginas: number
  }
}

export function GuiasView({ data }: GuiasViewProps) {
  const router = useRouter()

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Guías de internamiento
            </h1>

            <p className="text-sm text-muted-foreground">
              Registra el ingreso y la salida de contenedores del almacén.
            </p>
          </div>

          <CrearGuiaDialog onCreada={() => router.refresh()} />
        </div>

        <GuiasTable data={data} onCambio={() => router.refresh()} />
      </div>
    </div>
  )
}
