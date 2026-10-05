import { connection } from "next/server"

import { EstadisticasTrasegadoView } from "@/modules/trasegados/components/estadisticas/estadisticas-trasegado-view"
import { obtenerEstadisticasTrasegadoService } from "@/modules/trasegados/services/estadisticas-trasegado.service"

export const metadata = {
  title: "Estadísticas de trasegados",
}

export default async function EstadisticasTrasegadoPage() {
  await connection()
  const initialData = await obtenerEstadisticasTrasegadoService({
    periodo: "HISTORIAL",
  })

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
      <EstadisticasTrasegadoView initialData={initialData} />
    </div>
  )
}
