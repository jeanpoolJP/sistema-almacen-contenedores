// modules\trasegados\components\listar-guias\acciones-guia-menu.tsx

"use client"

import { EyeIcon, MoreHorizontalIcon, UserPlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AccionesGuiaMenuProps {
  onVerDetalle: () => void
  onAsignarCliente: () => void
}

/**
 * Menú de acciones por fila del listado.
 *
 * En Base UI, el DropdownMenuTrigger ya es un <button>.
 * Le pasamos `render` para usar nuestro Button de shadcn sin
 * anidar dos buttons.
 */
export function AccionesGuiaMenu({
  onVerDetalle,
  onAsignarCliente,
}: AccionesGuiaMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="Acciones"
          >
            <MoreHorizontalIcon className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={onVerDetalle} className="cursor-pointer">
          <EyeIcon className="mr-2 size-4" />
          Ver detalle
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAsignarCliente} className="cursor-pointer">
          <UserPlusIcon className="mr-2 size-4" />
          Asignar cliente
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
