"use client"

import {
  CreditCardIcon,
  EyeIcon,
  FileTextIcon,
  MoreHorizontalIcon,
  PencilIcon,
  UserRoundPenIcon,
  UserRoundPlusIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Guia = {
  cliente: { id: number } | null
  numeroCotizacion: string | null
  total: number | null
  estadoPago: "PENDIENTE" | "PAGADO"
}

interface GuiaAlquilerAccionesMenuProps<T extends Guia> {
  guia: T
  onVerDetalle: () => void
  onEditar: () => void
  onAsignarCliente: () => void
  onAsignarCotizacion: () => void
  onRegistrarPago: () => void
}

export function GuiaAlquilerAccionesMenu<T extends Guia>({
  guia,
  onVerDetalle,
  onEditar,
  onAsignarCliente,
  onAsignarCotizacion,
  onRegistrarPago,
}: GuiaAlquilerAccionesMenuProps<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="Acciones de guía"
          />
        }
      >
        <MoreHorizontalIcon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={onVerDetalle}>
          <EyeIcon className="mr-2 size-4" />
          Ver detalles
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEditar}>
          <PencilIcon className="mr-2 size-4" />
          Editar guía
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAsignarCliente}>
          {guia.cliente ? (
            <UserRoundPenIcon className="mr-2 size-4" />
          ) : (
            <UserRoundPlusIcon className="mr-2 size-4" />
          )}
          {guia.cliente ? "Cambiar cliente" : "Asignar cliente"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAsignarCotizacion}>
          <FileTextIcon className="mr-2 size-4" />
          {guia.numeroCotizacion ? "Editar cotización" : "Asignar cotización"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onRegistrarPago}
          disabled={!guia.numeroCotizacion || guia.total === null}
        >
          <CreditCardIcon className="mr-2 size-4" />
          {guia.estadoPago === "PAGADO" ? "Editar pago" : "Registrar pago"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
