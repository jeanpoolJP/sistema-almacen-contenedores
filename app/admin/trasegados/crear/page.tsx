import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CrearGuiaTrasegadoForm } from "@/modules/trasegados/components"

export const metadata = {
  title: "Crear guía de trasegado",
  description: "Registra una nueva guía de trasegado en el almacén.",
}

export default function CrearGuiaTrasegadoPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/trasegados"
          aria-label="Volver"
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
        >
          <ArrowLeftIcon className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Nueva guía de trasegado
          </h1>
          <p className="text-sm text-muted-foreground">
            Completa los datos del ingreso y los elementos transportados.
          </p>
        </div>
      </div>

      <CrearGuiaTrasegadoForm />
    </div>
  )
}
