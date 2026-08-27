/* eslint-disable react-hooks/set-state-in-effect */
// modules\vehiculos\components\vehiculos-page.tsx

"use client"

import { useEffect, useState } from "react"
import { Car, Plus, RefreshCw, Search } from "lucide-react"

import type { Vehiculo } from "../vehiculos.types"
import { listarVehiculos } from "../vehiculos.actions"

import { VehiculoForm } from "./vehiculo-form"
import { VehiculoTable } from "./vehiculo-table"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function VehiculosPage() {
  // ESTADO DE DATOS
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)

  // ESTADO DEL FORMULARIO
  const [vehiculoSeleccionado, setVehiculoSeleccionado] =
    useState<Vehiculo | null>(null)

  const [openForm, setOpenForm] = useState(false)

  // ESTADO DE BÚSQUEDA
  const [busqueda, setBusqueda] = useState("")

  // ESTADO DE CARGA
  const [loading, setLoading] = useState(true)

  /**
   * CARGAR VEHÍCULOS
   */
  async function cargarVehiculos(
    pagina: number = page,
    cantidad: number = pageSize
  ) {
    setLoading(true)

    try {
      const result = await listarVehiculos(pagina, cantidad)

      if (result.success) {
        setVehiculos(result.data.data)
        setTotal(result.data.total)
        setPage(result.data.page)
        setPageSize(result.data.pageSize)
        setTotalPages(result.data.totalPages)
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * CARGA INICIAL
   */
  useEffect(() => {
    cargarVehiculos(1, 10)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * BÚSQUEDA
   * Filtra los vehículos que están actualmente
   * cargados en la página.
   */
  const vehiculosFiltrados = vehiculos.filter((vehiculo) => {
    const termino = busqueda.trim().toLowerCase()

    if (!termino) {
      return true
    }

    return vehiculo.placa.toLowerCase().includes(termino)
  })

  /**
   * CAMBIAR PÁGINA
   */
  function handlePageChange(nuevaPagina: number) {
    cargarVehiculos(nuevaPagina, pageSize)
  }

  /**
   * CAMBIAR CANTIDAD DE FILAS
   */
  function handlePageSizeChange(nuevaCantidad: number) {
    cargarVehiculos(1, nuevaCantidad)
  }

  /**
   * NUEVO VEHÍCULO
   */
  function handleNuevoVehiculo() {
    setVehiculoSeleccionado(null)
    setOpenForm(true)
  }

  /**
   * EDITAR VEHÍCULO
   */
  function handleEditarVehiculo(vehiculo: Vehiculo) {
    setVehiculoSeleccionado(vehiculo)
    setOpenForm(true)
  }

  /**
   * DESPUÉS DE CREAR / ACTUALIZAR
   */
  async function handleSuccess() {
    setOpenForm(false)
    setVehiculoSeleccionado(null)
    await cargarVehiculos(page, pageSize)
  }

  /**
   * CONTROLAR DIÁLOGO
   */
  function handleOpenChange(open: boolean) {
    setOpenForm(open)

    if (!open) {
      setVehiculoSeleccionado(null)
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Car className="size-6" />

            <h1 className="text-2xl font-semibold tracking-tight">Vehículos</h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Administra los vehículos registrados en el sistema.
          </p>
        </div>

        <Button onClick={handleNuevoVehiculo}>
          <Plus className="mr-2 size-4" />
          Nuevo vehículo
        </Button>
      </div>

      {/* =====================================================
          DIALOG CREAR / EDITAR
      ====================================================== */}

      <Dialog open={openForm} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {vehiculoSeleccionado ? "Editar vehículo" : "Registrar vehículo"}
            </DialogTitle>
          </DialogHeader>

          <VehiculoForm
            vehiculo={
              vehiculoSeleccionado
                ? {
                    id: vehiculoSeleccionado.id,

                    placa: vehiculoSeleccionado.placa,
                  }
                : undefined
            }
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* =====================================================
          BARRA DE HERRAMIENTAS
      ====================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* BUSCADOR */}

        <div className="relative w-full sm:max-w-md">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={busqueda}
            onChange={(event) => {
              setBusqueda(event.target.value)

              /**
               * Cuando el usuario empieza una
               * nueva búsqueda volvemos a la
               * primera página.
               */
              if (page !== 1) {
                setPage(1)
              }
            }}
            placeholder="Buscar por placa..."
            className="pl-9 uppercase"
          />
        </div>

        {/* ACTUALIZAR */}

        <Button
          variant="outline"
          onClick={() => cargarVehiculos(page, pageSize)}
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`}
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
            Cargando vehículos...
          </p>
        </div>
      ) : (
        <VehiculoTable
          vehiculos={vehiculosFiltrados}
          total={total}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onEdit={handleEditarVehiculo}
          onRefresh={() => cargarVehiculos(page, pageSize)}
        />
      )}

      {/* =====================================================
          INFORMACIÓN
      ====================================================== */}

      {!loading && (
        <div className="text-sm text-muted-foreground">
          Mostrando{" "}
          <span className="font-medium text-foreground">
            {vehiculosFiltrados.length}
          </span>{" "}
          de <span className="font-medium text-foreground">{total}</span>{" "}
          vehículos.
        </div>
      )}
    </div>
  )
}
