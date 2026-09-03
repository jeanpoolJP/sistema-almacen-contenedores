// modules/inventario/components/inventario-page-client.tsx

"use client"

import { useState, useTransition } from "react"
import { RefreshCw } from "lucide-react"

import {
  crearInventarioAction,
  obtenerInventarioAction,
  verificarDetalleAction,
  finalizarInventarioAction,
} from "../inventario.action"

import { InventarioTable } from "./inventario-table"
import { InventarioDetalle } from "./inventario-detalle"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type Inventario = {
  id: number
  fecha: Date
  estado: "EN_PROCESO" | "FINALIZADO"
  observaciones: string | null
  _count: {
    detalles: number
  }
}

type InventarioDetalleData = {
  id: number
  guiaId: number
  resultado: "PENDIENTE" | "ENCONTRADO" | "NO_ENCONTRADO"
  observaciones: string | null
  verificadoAt: Date | null

  guia: {
    id: number
    numeroGuia: string
    fechaIngreso: Date
    estado: string

    contenedor: {
      id: number
      numeroContenedor: string
      medida: number
      tipo: "NORMAL" | "REEFER"
      marca: string
    }
  }
}

type InventarioCompleto = {
  id: number
  fecha: Date
  estado: "EN_PROCESO" | "FINALIZADO"
  observaciones: string | null
  detalles: InventarioDetalleData[]
}

type InventarioPageClientProps = {
  inventarios: Inventario[]
  page: number
  total: number
  totalPages: number
}

export function InventarioPageClient({
  inventarios,
  page,
  total,
  totalPages,
}: InventarioPageClientProps) {

  const [inventarioSeleccionado, setInventarioSeleccionado] =
    useState<InventarioCompleto | null>(null)

  const [dialogNuevo, setDialogNuevo] = useState(false)
  const [dialogDetalle, setDialogDetalle] = useState(false)

  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0])

  const [observaciones, setObservaciones] = useState("")

  const [isPending, startTransition] = useTransition()

  const router = useRouter()

  async function crearInventario() {
    if (!fecha) {
      return
    }

    startTransition(async () => {
      try {
        await crearInventarioAction(
          new Date(`${fecha}T00:00:00`),
          observaciones.trim() || undefined
        )

        setDialogNuevo(false)

        setFecha(new Date().toISOString().split("T")[0])

        setObservaciones("")

        router.refresh()
      } catch (error) {
        console.error("Error al crear inventario:", error)

        alert(
          error instanceof Error
            ? error.message
            : "No se pudo crear el inventario."
        )
      }
    })
  }

  async function verInventario(id: number) {
    startTransition(async () => {
      try {
        const inventario = await obtenerInventarioAction(id)

        setInventarioSeleccionado(inventario as InventarioCompleto)

        setDialogDetalle(true)
      } catch (error) {
        console.error("Error al obtener inventario:", error)

        alert(
          error instanceof Error
            ? error.message
            : "No se pudo obtener el inventario."
        )
      }
    })
  }

  async function verificarDetalle(
    detalleId: number,
    resultado: "PENDIENTE" | "ENCONTRADO" | "NO_ENCONTRADO"
  ) {
    if (!inventarioSeleccionado) {
      return
    }

    startTransition(async () => {
      try {
        await verificarDetalleAction(
          inventarioSeleccionado.id,
          detalleId,
          resultado
        )

        const inventarioActualizado = await obtenerInventarioAction(
          inventarioSeleccionado.id
        )

        setInventarioSeleccionado(inventarioActualizado as InventarioCompleto)
      } catch (error) {
        console.error("Error al verificar detalle:", error)

        alert(
          error instanceof Error
            ? error.message
            : "No se pudo actualizar la verificación."
        )
      }
    })
  }

  async function finalizarInventario() {
    if (!inventarioSeleccionado) {
      return
    }

    const confirmar = window.confirm(
      "¿Estás seguro de finalizar este inventario? Una vez finalizado ya no debería modificarse."
    )

    if (!confirmar) {
      return
    }

    startTransition(async () => {
      try {
        await finalizarInventarioAction(inventarioSeleccionado.id)

        const inventarioActualizado = await obtenerInventarioAction(
          inventarioSeleccionado.id
        )

        setInventarioSeleccionado(inventarioActualizado as InventarioCompleto)

      } catch (error) {
        console.error("Error al finalizar inventario:", error)

        alert(
          error instanceof Error
            ? error.message
            : "No se pudo finalizar el inventario."
        )
      }
    })
  }

  function actualizarDatos() {
    router.refresh()
  }

  function cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina < 1 || nuevaPagina > totalPages) {
      return
    }

    router.push(`/admin/inventario?page=${nuevaPagina}`)
  }

  return (
    <>
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={actualizarDatos}
          disabled={isPending}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`}
          />
          Actualizar
        </Button>
      </div>

      <InventarioTable
        inventarios={inventarios}
        onNuevo={() => setDialogNuevo(true)}
        onVer={verInventario}
      />

      {totalPages > 0 && (
        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Página {page} de {totalPages} · {total} inventarios
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => cambiarPagina(page - 1)}
              disabled={page <= 1 || isPending}
            >
              Anterior
            </Button>

            <span className="min-w-[80px] text-center text-sm font-medium">
              {page} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => cambiarPagina(page + 1)}
              disabled={page >= totalPages || isPending}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* DIALOG: NUEVO INVENTARIO */}
      {/* ================================================== */}

      <Dialog open={dialogNuevo} onOpenChange={setDialogNuevo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo inventario</DialogTitle>

            <DialogDescription>
              Se incluirán automáticamente todas las guías que actualmente se
              encuentran en estado ALMACENADO.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha del inventario</Label>

              <Input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(event) => setFecha(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>

              <Textarea
                id="observaciones"
                placeholder="Observaciones del inventario..."
                value={observaciones}
                onChange={(event) => setObservaciones(event.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogNuevo(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>

            <Button onClick={crearInventario} disabled={isPending || !fecha}>
              {isPending ? "Creando..." : "Crear inventario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================== */}
      {/* DIALOG: DETALLE DEL INVENTARIO */}
      {/* ================================================== */}

      <Dialog open={dialogDetalle} onOpenChange={setDialogDetalle}>
        {/* DESPUÉS */}
        <DialogContent className="max-h-[90vh] w-[95vw] overflow-y-auto sm:max-w-[95vw] lg:max-w-7xl print:max-h-none print:overflow-visible print:border-none print:p-0 print:shadow-none">
          {" "}
          <DialogHeader>
            <DialogTitle>Gestión del inventario</DialogTitle>

            <DialogDescription>
              Verifica físicamente cada contenedor y registra el resultado.
            </DialogDescription>
          </DialogHeader>
          {inventarioSeleccionado && (
            <InventarioDetalle
              inventarioId={inventarioSeleccionado.id}
              fecha={inventarioSeleccionado.fecha}
              estado={inventarioSeleccionado.estado}
              detalles={inventarioSeleccionado.detalles}
              onVerificar={verificarDetalle}
              onFinalizar={finalizarInventario}
            />
          )}
          {isPending && (
            <div className="py-2 text-center text-sm text-muted-foreground">
              Actualizando...
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
