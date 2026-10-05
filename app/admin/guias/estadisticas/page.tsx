import { connection } from "next/server"

import { EstadisticasGuiasView } from "@/modules/guias/components/estadisticas/estadisticas-guias-view"
import { obtenerEstadisticasGuiasService } from "@/modules/guias/estadisticas.service"

export const metadata = {
  title: "Estadísticas de guías",
}

export default async function EstadisticasGuiasPage() {
  await connection()
  const initialData = await obtenerEstadisticasGuiasService({
    periodo: "HISTORIAL",
  })

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
      <EstadisticasGuiasView initialData={initialData} />
    </div>
  )
}
