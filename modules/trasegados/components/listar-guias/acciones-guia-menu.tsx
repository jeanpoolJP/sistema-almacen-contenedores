// modules\trasegados\components\listar-guias\acciones-guia-menu.tsx

"use client"

import {
  EyeIcon,
  MoreHorizontalIcon,
  PackageOpenIcon,
  UserPlusIcon,
} from "lucide-react"

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
  onRegistrarSalida: () => void
  /** Si la guía está finalizada, deshabilitamos la acción de salida. */
  puedeRegistrarSalida: boolean
}

export function AccionesGuiaMenu({
  onVerDetalle,
  onAsignarCliente,
  onRegistrarSalida,
  puedeRegistrarSalida,
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
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={onVerDetalle} className="cursor-pointer">
          <EyeIcon className="mr-2 size-4" />
          Ver detalle
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAsignarCliente} className="cursor-pointer">
          <UserPlusIcon className="mr-2 size-4" />
          Asignar cliente
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onRegistrarSalida}
          disabled={!puedeRegistrarSalida}
          className="cursor-pointer"
        >
          <PackageOpenIcon className="mr-2 size-4" />
          Registrar salida
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
