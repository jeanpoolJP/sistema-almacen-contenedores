// app/admin/inventario/page.tsx

import { listarInventariosAction } from "@/modules/inventario/inventario.action"
import { InventarioPageClient } from "@/modules/inventario/components/inventario-page-client"

const INVENTARIOS_POR_PAGINA = 10

type InventarioPageProps = {
  searchParams: Promise<{
    page?: string
  }>
}

export default async function InventarioPage({
  searchParams,
}: InventarioPageProps) {
  const params = await searchParams

  const pageSolicitada = Number(params.page)

  const page =
    Number.isInteger(pageSolicitada) && pageSolicitada > 0 ? pageSolicitada : 1

  const resultado = await listarInventariosAction(page, INVENTARIOS_POR_PAGINA)

  return (
    <main className="container mx-auto space-y-6 px-4 py-6">
      <InventarioPageClient
        inventarios={resultado.inventarios}
        page={resultado.page}
        total={resultado.total}
        totalPages={resultado.totalPages}
      />
    </main>
  )
}
