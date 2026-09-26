// app\admin\liquidaciones\nueva\page.tsx

import { prisma } from "@/lib/prisma"
import { LiquidacionForm } from "@/modules/liquidaciones/components/liquidacion-form"

export default async function Page() {
  const clientes = await prisma.cliente.findMany({
    where: { activo: true },
    select: { id: true, nombreCompleto: true, numeroDocumento: true },
    orderBy: { nombreCompleto: "asc" },
  })
  return <LiquidacionForm clientes={clientes} />
}
