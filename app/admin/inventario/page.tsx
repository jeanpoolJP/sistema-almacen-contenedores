// app/admin/inventario/page.tsx

import { listarInventariosAction } from "@/modules/inventario/inventario.action"
import { InventarioPageClient } from "@/modules/inventario/components/inventario-page-client"

export default async function InventarioPage() {
  const inventarios = await listarInventariosAction()

  return (
    <main className="container mx-auto space-y-6 px-4 py-6">
      <InventarioPageClient inventarios={inventarios} />
    </main>
  )
}

