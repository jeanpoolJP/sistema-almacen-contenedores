import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { EstadoPago } from "@/lib/generated/prisma"

const ESTADO_PAGO_CONFIG: Record<
  EstadoPago,
  { label: string; className: string }
> = {
  PENDIENTE: {
    label: "Pendiente",
    className: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50",
  },

  PAGADO: {
    label: "Pagado",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
  },
}

export function EstadoPagoBadge({ estado }: { estado: EstadoPago }) {
  const config = ESTADO_PAGO_CONFIG[estado]

  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  )
}
