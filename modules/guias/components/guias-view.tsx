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

export function GuiasView({
  data,
}: GuiasViewProps) {
  const router = useRouter()

  return (
    <div className="w-full px-4 py-6">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Guías de internamiento
            </h1>

            <p className="text-sm text-muted-foreground">
              Registra el ingreso y la salida de contenedores del almacén.
            </p>
          </div>

          <CrearGuiaDialog
            onCreada={() => router.refresh()}
          />
        </div>

        <GuiasTable
          data={data}
          onCambio={() => router.refresh()}
        />
      </div>
    </div>
  )
}