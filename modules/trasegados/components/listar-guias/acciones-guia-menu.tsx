// modules\trasegados\components\listar-guias\acciones-guia-menu.tsx

"use client"

import {
  CheckCircle2Icon,
  EyeIcon,
  MoreHorizontalIcon,
  PackageOpenIcon,
  RotateCcwIcon,
  UserPlusIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AccionesGuiaMenuProps {
  onVerDetalle: () => void
  onAsignarCliente: () => void
  onRegistrarSalida: () => void
  onFinalizar: () => void
  onReactivar: () => void
  estado: "EN_PROCESO" | "FINALIZADO"
}

export function AccionesGuiaMenu({
  onVerDetalle,
  onAsignarCliente,
  onRegistrarSalida,
  onFinalizar,
  onReactivar,
  estado,
}: AccionesGuiaMenuProps) {
  const enProceso = estado === "EN_PROCESO"

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

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onRegistrarSalida}
          disabled={!enProceso}
          className="cursor-pointer"
        >
          <PackageOpenIcon className="mr-2 size-4" />
          Registrar salida
        </DropdownMenuItem>

        {enProceso ? (
          <DropdownMenuItem
            onClick={onFinalizar}
            className="cursor-pointer text-emerald-700 focus:text-emerald-700"
          >
            <CheckCircle2Icon className="mr-2 size-4" />
            Finalizar guía
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={onReactivar}
            className="cursor-pointer text-amber-700 focus:text-amber-700"
          >
            <RotateCcwIcon className="mr-2 size-4" />
            Reactivar guía
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
