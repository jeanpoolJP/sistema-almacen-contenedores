// modules\trasegados\components\shared\form-section.tsx

import type { ReactNode } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface FormSectionProps {
  title: string
  description?: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * Contenedor visual reutilizable para agrupar campos del formulario.
 */
export function FormSection({
  title,
  description,
  icon,
  children,
  className,
}: FormSectionProps) {
  return (
    /* py-0 gap-0 quita el padding/gap global que mete la Card de shadcn v4 */
    <Card className={cn("gap-0 overflow-hidden py-0", className)}>
      <CardHeader className="border-b bg-muted/30 p-4 sm:p-6">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}
          <div className="space-y-0.5">
            <CardTitle className="text-base">{title}</CardTitle>
            {description && (
              <CardDescription className="text-xs">
                {description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      {/* px para costados y pt-6 pb-6 para darle espacio real con la línea divisoria */}
      <CardContent className="px-4 pt-6 pb-6 sm:px-6">{children}</CardContent>
    </Card>
  )
}
