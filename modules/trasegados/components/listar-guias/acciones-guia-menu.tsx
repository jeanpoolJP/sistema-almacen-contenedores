// modules\trasegados\components\listar-guias\acciones-guia-menu.tsx

"use client"

import {
  CheckCircle2Icon,
  CreditCardIcon,
  EyeIcon,
  MoreHorizontalIcon,
  PackageOpenIcon,
  TruckIcon,
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
  onRegistrarIngreso: () => void
  onFinalizar: () => void
  onReactivar: () => void
  onRegistrarPago: () => void
  onRevertirPago: () => void
  estado: "EN_PROCESO" | "FINALIZADO"
  estadoPago: "PENDIENTE" | "PAGADO"
}

export function AccionesGuiaMenu({
  onVerDetalle,
  onAsignarCliente,
  onRegistrarSalida,
  onRegistrarIngreso,
  onFinalizar,
  onReactivar,
  onRegistrarPago,
  onRevertirPago,
  estado,
  estadoPago,
}: AccionesGuiaMenuProps) {
  const enProceso = estado === "EN_PROCESO"
  const pagado = estadoPago === "PAGADO"

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
          onClick={onRegistrarIngreso}
          disabled={!enProceso}
          className="cursor-pointer"
        >
          <TruckIcon className="mr-2 size-4" />
          Registrar nuevo ingreso
        </DropdownMenuItem>

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

        <DropdownMenuSeparator />

        {!pagado ? (
          <DropdownMenuItem
            onClick={onRegistrarPago}
            className="cursor-pointer"
          >
            <CreditCardIcon className="mr-2 size-4" />
            Registrar pago
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem
              onClick={onRegistrarPago}
              className="cursor-pointer"
            >
              <CreditCardIcon className="mr-2 size-4" />
              Editar pago
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onRevertirPago}
              className="cursor-pointer text-rose-700 focus:text-rose-700"
            >
              <RotateCcwIcon className="mr-2 size-4" />
              Revertir pago
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
