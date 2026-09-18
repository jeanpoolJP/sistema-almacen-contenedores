import { DetalleGuiaTrasegadoView } from "@/modules/trasegados/components/detalle-guia"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DetalleGuiaPage({ params }: PageProps) {
  const { id } = await params
  const guiaId = Number(id)

  if (Number.isNaN(guiaId)) {
    return (
      <div className="mx-auto w-full max-w-6xl p-6">
        <p className="text-sm text-destructive">ID inválido.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <DetalleGuiaTrasegadoView guiaId={guiaId} />
    </div>
  )
}
