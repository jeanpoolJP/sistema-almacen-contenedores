// modules\flat-racks\components\flat-racks-page.tsx

"use client"

import { useEffect, useState } from "react"
import {
  Plus,
  RefreshCw,
  Search,
} from "lucide-react"

import type { FlatRack } from "../flat-rack.types"

import {
  listFlatRacksAction,
} from "../flat-rack.actions"

import { FlatRackForm } from "./flat-rack-form"
import { FlatRackTable } from "./flat-rack-table"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function FlatRacksPage() {
  const [flatRacks, setFlatRacks] =
    useState<FlatRack[]>([])

  const [
    flatRackSeleccionado,
    setFlatRackSeleccionado,
  ] = useState<FlatRack | null>(null)

  const [openForm, setOpenForm] =
    useState(false)

  const [busqueda, setBusqueda] =
    useState("")

  const [loading, setLoading] =
    useState(true)

  // ============================================================
  // PAGINACIÓN
  // ============================================================

  const [page, setPage] = useState(1)

  const [pageSize, setPageSize] =
    useState(10)

  const [totalPages, setTotalPages] =
    useState(1)

  const [totalFlatRacks, setTotalFlatRacks] =
    useState(0)

  /**
   * Obtiene los Flat Racks desde el servidor.
   *
   * La búsqueda y paginación se procesan
   * en el backend.
   */
  async function cargarFlatRacks(
    pagina: number = page,
    cantidad: number = pageSize,
    search: string = busqueda,
  ) {
    setLoading(true)

    try {
      const result =
        await listFlatRacksAction({
          page: pagina,
          pageSize: cantidad,
          search: search.trim() || undefined,
        })

      if (!result.success) {
        return
      }

      setFlatRacks(result.data.items)

      setPage(result.data.page)

      setPageSize(result.data.pageSize)

      setTotalPages(result.data.totalPages)

      setTotalFlatRacks(result.data.total)
    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // CARGA INICIAL
  // ============================================================

  useEffect(() => {
    cargarFlatRacks(1, 10, "")
  }, [])

  // ============================================================
  // BÚSQUEDA
  // ============================================================

  function handleBusquedaChange(
    value: string,
  ) {
    setBusqueda(value)

    cargarFlatRacks(
      1,
      pageSize,
      value,
    )
  }

  // ============================================================
  // PAGINACIÓN
  // ============================================================

  function handlePageChange(
    nuevaPagina: number,
  ) {
    cargarFlatRacks(
      nuevaPagina,
      pageSize,
      busqueda,
    )
  }

  function handlePageSizeChange(
    nuevaCantidad: number,
  ) {
    setPageSize(nuevaCantidad)

    cargarFlatRacks(
      1,
      nuevaCantidad,
      busqueda,
    )
  }

  // ============================================================
  // FORMULARIO
  // ============================================================

  function handleNuevoFlatRack() {
    setFlatRackSeleccionado(null)
    setOpenForm(true)
  }

  function handleEditarFlatRack(
    flatRack: FlatRack,
  ) {
    setFlatRackSeleccionado(flatRack)
    setOpenForm(true)
  }

  async function handleSuccess() {
    setOpenForm(false)
    setFlatRackSeleccionado(null)

    await cargarFlatRacks(
      page,
      pageSize,
      busqueda,
    )
  }

  function handleOpenChange(
    open: boolean,
  ) {
    setOpenForm(open)

    if (!open) {
      setFlatRackSeleccionado(null)
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Flat Racks
          </h1>

          <p className="text-sm text-muted-foreground">
            Administra los Flat Racks registrados
            en el almacén.
          </p>
        </div>

        <Button
          onClick={handleNuevoFlatRack}
        >
          <Plus className="mr-2 size-4" />

          Nuevo Flat Rack
        </Button>
      </div>

      {/* =====================================================
          DIALOG CREAR / EDITAR
      ====================================================== */}

      <Dialog
        open={openForm}
        onOpenChange={handleOpenChange}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {flatRackSeleccionado
                ? "Editar Flat Rack"
                : "Registrar Flat Rack"}
            </DialogTitle>
          </DialogHeader>

          <FlatRackForm
            flatRack={flatRackSeleccionado}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* =====================================================
          BARRA DE HERRAMIENTAS
      ====================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Búsqueda */}

        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={busqueda}
            onChange={(event) =>
              handleBusquedaChange(
                event.target.value,
              )
            }
            placeholder="Buscar por número o marca..."
            className="pl-9"
          />
        </div>

        {/* Actualizar */}

        <Button
          variant="outline"
          onClick={() =>
            cargarFlatRacks(
              page,
              pageSize,
              busqueda,
            )
          }
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 size-4 ${
              loading
                ? "animate-spin"
                : ""
            }`}
          />

          Actualizar
        </Button>
      </div>

      {/* =====================================================
          TABLA
      ====================================================== */}

      {loading ? (
        <div className="rounded-lg border p-8 text-center">
          <RefreshCw className="mx-auto size-5 animate-spin text-muted-foreground" />

          <p className="mt-2 text-sm text-muted-foreground">
            Cargando Flat Racks...
          </p>
        </div>
      ) : (
        <FlatRackTable
          flatRacks={flatRacks}
          onEdit={handleEditarFlatRack}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          total={totalFlatRacks}
          onPageChange={handlePageChange}
          onPageSizeChange={
            handlePageSizeChange
          }
        />
      )}

      {/* =====================================================
          INFORMACIÓN
      ====================================================== */}

      {!loading && (
        <div className="text-sm text-muted-foreground">
          Mostrando{" "}
          <span className="font-medium text-foreground">
            {flatRacks.length}
          </span>{" "}
          de{" "}
          <span className="font-medium text-foreground">
            {totalFlatRacks}
          </span>{" "}
          Flat Racks.
        </div>
      )}
    </div>
  )
}
