// modules\liquidaciones\components\liquidacion-back-button.tsx

"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LiquidacionBackButton({
  href = "/admin/liquidaciones",
  label = "Volver al listado",
}: {
  href?: string
  label?: string
}) {
  return (
    <Button variant="ghost" size="sm" className="mb-2 gap-2">
      <Link href={href} className="inline-flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        <span>{label}</span>
      </Link>
    </Button>
  )
}
