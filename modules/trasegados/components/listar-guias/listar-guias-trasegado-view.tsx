// modules\trasegados\components\listar-guias\listar-guias-trasegado-view.tsx

"use client"

import { PlusIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { FiltrosGuiasTrasegado } from "./filtros-guias-trasegado"
import { TablaGuiasTrasegado } from "./tabla-guias-trasegado"
import { AsignarClienteModal } from "../asignar-cliente/asignar-cliente-modal"
import { FinalizarGuiaModal } from "../finalizar-guia/finalizar-guia-modal"
import { RegistrarSalidaModal } from "../registrar-salida/registrar-salida-modal"
import { useListarGuiasTrasegado } from "../../hooks/use-listar-guias-trasegado"
import { RegistrarPagoModal } from "../registrar-pago/registrar-pago-modal"
import { RegistrarIngresoModal } from "../registrar-ingreso/registrar-ingreso-modal"
import { revertirPagoAction } from "../../actions/registrar-pago.action"

type ModalGuia = {
  open: boolean
  guiaId: number
  numeroGuia: string
}

export function ListarGuiasTrasegadoView() {
  const router = useRouter()

  const {
    filtros,
    result,
    isPending,
    actualizarFiltro,
    limpiarFiltros,
    irAPagina,
    cambiarOrden,
    refetch,
  } = useListarGuiasTrasegado()

  // Estado del modal de asignar cliente
  const [asignarCliente, setAsignarCliente] = useState<{
    open: boolean
    guiaId: number
    numeroGuia: string
  }>({
    open: false,
    guiaId: 0,
    numeroGuia: "",
  })

  const [registrarSalida, setRegistrarSalida] = useState({
    open: false,
    guiaId: 0,
    numeroGuia: "",
  })

  const [registrarIngreso, setRegistrarIngreso] = useState({
    open: false,
    guiaId: 0,
    numeroGuia: "",
  })

  const [cambiarEstado, setCambiarEstado] = useState({
    open: false,
    guiaId: 0,
    numeroGuia: "",
    finalizar: true,
  })

  const [registrarPago, setRegistrarPago] = useState<ModalGuia>({
    open: false,
    guiaId: 0,
    numeroGuia: "",
  })

  const [confirmarRevertir, setConfirmarRevertir] = useState<ModalGuia>({
    open: false,
    guiaId: 0,
    numeroGuia: "",
  })

  const handleVerDetalle = (id: number) => {
    router.push(`/admin/trasegados/${id}`)
  }

  const handleAbrirAsignarCliente = (id: number, numeroGuia: string) => {
    setAsignarCliente({ open: true, guiaId: id, numeroGuia })
  }

  const handleAbrirRegistrarSalida = (id: number, numeroGuia: string) => {
    setRegistrarSalida({ open: true, guiaId: id, numeroGuia })
  }

  const handleAbrirFinalizar = (id: number, numeroGuia: string) => {
    setCambiarEstado({ open: true, guiaId: id, numeroGuia, finalizar: true })
  }

  const handleAbrirReactivar = (id: number, numeroGuia: string) => {
    setCambiarEstado({ open: true, guiaId: id, numeroGuia, finalizar: false })
  }

  const handleRevertirPago = async () => {
    const res = await revertirPagoAction(confirmarRevertir.guiaId)
    if (res.success) {
      toast.success(res.message)
      refetch()
    } else {
      toast.error(res.message)
    }
    setConfirmarRevertir({ open: false, guiaId: 0, numeroGuia: "" })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Guías de trasegado
          </h1>
          <p className="text-sm text-muted-foreground">
            Administra y consulta las guías registradas en el almacén.
          </p>
        </div>
        <Link href="/admin/trasegados/crear" className={cn(buttonVariants())}>
          <PlusIcon className="mr-2 size-4" />
          Nueva guía
        </Link>
      </div>

      <FiltrosGuiasTrasegado
        filtros={filtros}
        onChange={actualizarFiltro}
        onLimpiar={limpiarFiltros}
      />

      <TablaGuiasTrasegado
        result={result}
        isLoading={isPending && !result}
        onVerDetalle={(id) => router.push(`/admin/trasegados/${id}`)}
        onAsignarCliente={(id, numeroGuia) =>
          setAsignarCliente({ open: true, guiaId: id, numeroGuia })
        }
        onRegistrarSalida={(id, numeroGuia) =>
          setRegistrarSalida({ open: true, guiaId: id, numeroGuia })
        }
        onRegistrarIngreso={(id, numeroGuia) =>
          setRegistrarIngreso({ open: true, guiaId: id, numeroGuia })
        }
        onFinalizar={(id, numeroGuia) =>
          setCambiarEstado({
            open: true,
            guiaId: id,
            numeroGuia,
            finalizar: true,
          })
        }
        onReactivar={(id, numeroGuia) =>
          setCambiarEstado({
            open: true,
            guiaId: id,
            numeroGuia,
            finalizar: false,
          })
        }
        onRegistrarPago={(id, numeroGuia) =>
          setRegistrarPago({ open: true, guiaId: id, numeroGuia })
        }
        onRevertirPago={(id, numeroGuia) =>
          setConfirmarRevertir({ open: true, guiaId: id, numeroGuia })
        }
        onIrAPagina={irAPagina}
        onCambiarOrden={cambiarOrden}
        ordenActual={filtros.ordenarPor ?? "fechaIngreso"}
      />

      <AsignarClienteModal
        open={asignarCliente.open}
        onOpenChange={(open: boolean) =>
          setAsignarCliente((prev) => ({ ...prev, open }))
        }
        guiaId={asignarCliente.guiaId}
        numeroGuia={asignarCliente.numeroGuia}
        onSuccess={refetch}
      />

      <RegistrarSalidaModal
        open={registrarSalida.open}
        onOpenChange={(open) =>
          setRegistrarSalida((prev) => ({ ...prev, open }))
        }
        guiaId={registrarSalida.guiaId}
        numeroGuia={registrarSalida.numeroGuia}
        onSuccess={refetch}
      />

      <RegistrarIngresoModal
        open={registrarIngreso.open}
        onOpenChange={(open) =>
          setRegistrarIngreso((prev) => ({ ...prev, open }))
        }
        guiaId={registrarIngreso.guiaId}
        numeroGuia={registrarIngreso.numeroGuia}
        onSuccess={refetch}
      />

      <FinalizarGuiaModal
        open={cambiarEstado.open}
        onOpenChange={(open) => setCambiarEstado((prev) => ({ ...prev, open }))}
        guiaId={cambiarEstado.guiaId}
        numeroGuia={cambiarEstado.numeroGuia}
        finalizar={cambiarEstado.finalizar}
        onSuccess={refetch}
      />

      <RegistrarPagoModal
        open={registrarPago.open}
        onOpenChange={(open: boolean) =>
          setRegistrarPago((prev: ModalGuia) => ({ ...prev, open }))
        }
        guiaId={registrarPago.guiaId}
        numeroGuia={registrarPago.numeroGuia}
        onSuccess={refetch}
      />

      {/* AlertDialog de confirmación para revertir pago */}
      <AlertDialog
        open={confirmarRevertir.open}
        onOpenChange={(open: boolean) =>
          setConfirmarRevertir((prev: ModalGuia) => ({ ...prev, open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Revertir el pago?</AlertDialogTitle>
            <AlertDialogDescription>
              La guía{" "}
              <span className="font-mono font-medium">
                {confirmarRevertir.numeroGuia}
              </span>{" "}
              volverá al estado <strong>Pendiente de pago</strong>. Los montos
              calculados se conservarán.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevertirPago}>
              Revertir pago
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
