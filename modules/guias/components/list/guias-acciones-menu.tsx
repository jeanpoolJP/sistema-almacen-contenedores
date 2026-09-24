// modules/guias/components/list/guias-acciones-menu.tsx

"use client"

import {
  Ban,
  CreditCard,
  Eye,
  LogOut,
  MoreHorizontal,
  Pencil,
  Undo2,
  UserPlus,
  UserRoundPen,
} from "lucide-react"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { AsignarClienteDialog } from "../asignar-cliente/asignar-cliente-dialog"

import type { GuiaConRelaciones } from "../guia-con-relaciones.type"

type GuiasAccionesMenuProps = {
  guia: GuiaConRelaciones

  onVerDetalle: (guia: GuiaConRelaciones) => void
  onEditarIngreso: (guia: GuiaConRelaciones) => void
  onRegistrarSalida: (guia: GuiaConRelaciones) => void
  onAnularSalida: (guia: GuiaConRelaciones) => void
  onRegistrarPago: (guia: GuiaConRelaciones) => void
  onAnular: (guia: GuiaConRelaciones) => void

  onCambio: () => void
}

export function GuiasAccionesMenu({
  guia,
  onVerDetalle,
  onEditarIngreso,
  onRegistrarSalida,
  onAnularSalida,
  onRegistrarPago,
  onAnular,
  onCambio,
}: GuiasAccionesMenuProps) {
  const puedeRegistrarSalida = guia.estado === "ALMACENADO"
  const puedeAnularSalida =
    guia.estado === "RETIRADO" &&
    guia.estadoPago === "PENDIENTE" &&
    Boolean(guia.fechaSalida)
  const puedeRegistrarPago =
    guia.estado === "RETIRADO" && guia.estadoPago === "PENDIENTE"
  const puedeAnular = guia.estado === "ALMACENADO"
  const [asignarClienteAbierto, setAsignarClienteAbierto] = useState(false)

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

        <DropdownMenuItem onClick={() => setAsignarClienteAbierto(true)}>
          {guia.cliente ? (
            <UserRoundPen className="mr-2 size-4" />
          ) : (
            <UserPlus className="mr-2 size-4" />
          )}
          {guia.cliente ? "Cambiar cliente" : "Asignar cliente"}
        </DropdownMenuItem>

        {guia.estado === "ALMACENADO" && (
          <DropdownMenuItem onClick={() => onEditarIngreso(guia)}>
            <Pencil className="mr-2 size-4" />
            Editar ingreso
          </DropdownMenuItem>
        )}

        {puedeRegistrarSalida && (
          <DropdownMenuItem onClick={() => onRegistrarSalida(guia)}>
            <LogOut className="mr-2 size-4" />
            Registrar salida
          </DropdownMenuItem>
        )}

        {puedeAnularSalida && (
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onAnularSalida(guia)}
          >
            <Undo2 className="mr-2 size-4" />
            Anular salida
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

      <AsignarClienteDialog
        guiaId={guia.id}
        numeroGuia={guia.numeroGuia}
        clienteActual={guia.cliente}
        open={asignarClienteAbierto}
        onOpenChange={setAsignarClienteAbierto}
        onAsignada={onCambio}
      />
    </DropdownMenu>
  )
}
