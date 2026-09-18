// modules\trasegados\components\listar-guias\estado-badge.tsx

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface EstadoBadgeProps {
  estado: "EN_PROCESO" | "FINALIZADO"
}

export function EstadoBadge({ estado }: EstadoBadgeProps) {
  const config = {
    EN_PROCESO: {
      label: "En proceso",
      className:
        "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200",
    },
    FINALIZADO: {
      label: "Finalizado",
      className:
        "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200",
    },
  } as const

  const c = config[estado]
  return (
    <Badge variant="outline" className={cn("font-medium", c.className)}>
      {c.label}
    </Badge>
  )
}

interface EstadoPagoBadgeProps {
  estadoPago: "PENDIENTE" | "PAGADO"
}

export function EstadoPagoBadge({ estadoPago }: EstadoPagoBadgeProps) {
  const config = {
    PENDIENTE: {
      label: "Pendiente",
      className: "bg-rose-100 text-rose-800 hover:bg-rose-100 border-rose-200",
    },
    PAGADO: {
      label: "Pagado",
      className: "bg-sky-100 text-sky-800 hover:bg-sky-100 border-sky-200",
    },
  } as const

  const c = config[estadoPago]
  return (
    <Badge variant="outline" className={cn("font-medium", c.className)}>
      {c.label}
    </Badge>
  )
}
