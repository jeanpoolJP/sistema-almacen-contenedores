// modules/guias/components/list/guias-toolbar.tsx

"use client"

import { Loader2 } from "lucide-react"

type GuiasToolbarProps = {
  total: number
  isPending: boolean
}

export function GuiasToolbar({ total, isPending }: GuiasToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        {total === 0
          ? "No hay guías"
          : `${total} ${total === 1 ? "guía" : "guías"} encontradas`}
      </p>

      {isPending && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Actualizando...
        </div>
      )}
    </div>
  )
}
