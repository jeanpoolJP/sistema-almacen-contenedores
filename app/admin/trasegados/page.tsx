// app\admin\trasegados\page.tsx

import { ListarGuiasTrasegadoView } from "@/modules/trasegados/components/listar-guias"

export const metadata = {
  title: "Guías de trasegado",
}

export default function TrasegadosPage() {
  return (
    <div className="mx-auto w-full max-w-7xl p-6">
      <ListarGuiasTrasegadoView />
    </div>
  )
}
