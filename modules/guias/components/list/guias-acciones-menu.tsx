// modules/guias/components/list/guias-acciones-menu.tsx

"use client"

import { Ban, CreditCard, Eye, LogOut, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { GuiaConRelaciones } from "../guia-con-relaciones.type"

type GuiasAccionesMenuProps = {
  guia: GuiaConRelaciones
  onVerDetalle: (guia: GuiaConRelaciones) => void
  onRegistrarSalida: (guia: GuiaConRelaciones) => void
  onRegistrarPago: (guia: GuiaConRelaciones) => void
  onAnular: (guia: GuiaConRelaciones) => void
}

export function GuiasAccionesMenu({
  guia,
  onVerDetalle,
  onRegistrarSalida,
  onRegistrarPago,
  onAnular,
}: GuiasAccionesMenuProps) {
  const puedeRegistrarSalida = guia.estado === "ALMACENADO"
  const puedeRegistrarPago =
    guia.estado === "RETIRADO" && guia.estadoPago === "PENDIENTE"
  const puedeAnular = guia.estado === "ALMACENADO"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" className="size-8" />}
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onVerDetalle(guia)}>
          <Eye className="mr-2 size-4" />
          Ver detalles
        </DropdownMenuItem>

        {puedeRegistrarSalida && (
          <DropdownMenuItem onClick={() => onRegistrarSalida(guia)}>
            <LogOut className="mr-2 size-4" />
            Registrar salida
          </DropdownMenuItem>
        )}

        {puedeRegistrarPago && (
          <DropdownMenuItem onClick={() => onRegistrarPago(guia)}>
            <CreditCard className="mr-2 size-4" />
            Registrar pago
          </DropdownMenuItem>
        )}

        {puedeAnular && (
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onAnular(guia)}
          >
            <Ban className="mr-2 size-4" />
            Anular guía
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
