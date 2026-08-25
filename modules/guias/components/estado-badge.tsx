// modules/guias/components/estado-badge.tsx

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EstadoGuia } from "@/lib/generated/prisma";

const ESTADO_CONFIG: Record<
  EstadoGuia,
  { label: string; className: string }
> = {
  ALMACENADO: {
    label: "Almacenado",
    className:
      "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50",
  },
  RETIRADO: {
    label: "Retirado",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
  },
  ANULADO: {
    label: "Anulado",
    className:
      "bg-red-50 text-red-700 border-red-200 hover:bg-red-50",
  },
};

export function EstadoBadge({ estado }: { estado: EstadoGuia }) {
  const config = ESTADO_CONFIG[estado];

  return (
    <Badge
      variant="outline"
      className={cn("font-medium", config.className)}
    >
      {config.label}
    </Badge>
  );
}
