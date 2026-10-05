// modules/guias/components/guias-view.tsx

"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChartNoAxesCombinedIcon } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CrearGuiaDialog } from "./crear-guia-dialog"
import { GuiasTable } from "./list/guias-table"
import { AsignarClienteEspacioAlquiladoDialog } from "./asignar-cliente-espacio-alquilado-dialog"

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

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/admin/guias/estadisticas"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              <ChartNoAxesCombinedIcon className="mr-2 size-4" />
              Ver estadísticas
            </Link>
            <AsignarClienteEspacioAlquiladoDialog
              onAsignada={() => router.refresh()}
            />

            <CrearGuiaDialog onCreada={() => router.refresh()} />
          </div>
        </div>

        <GuiasTable data={data} />
      </div>
    </div>
  )
}
