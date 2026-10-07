/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useCallback, useEffect, useState } from "react"
import { Plus, RefreshCw, Search, Wrench } from "lucide-react"
import { toast } from "sonner"

import type { Equipo } from "../equipos.types"
import { listarEquipos } from "../equipos.actions"
import { EquipoForm } from "./equipo-form"
import { EquipoTable } from "./equipo-table"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function EquiposPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<Equipo | null>(
    null
  )
  const [openForm, setOpenForm] = useState(false)
  const [busqueda, setBusqueda] = useState("")
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalEquipos, setTotalEquipos] = useState(0)

  const cargarEquipos = useCallback(
    async (
      pagina: number = page,
      cantidad: number = pageSize,
      termino: string = busqueda
    ) => {
      setLoading(true)

      try {
        const resultado = await listarEquipos({
          pagina,
          porPagina: cantidad,
          busqueda: termino,
        })

        if (!resultado.success) {
          toast.error(resultado.error)
          return
        }

        setEquipos(resultado.data.equipos)
        setPage(resultado.data.pagina)
        setPageSize(resultado.data.porPagina)
        setTotalPages(resultado.data.totalPaginas)
        setTotalEquipos(resultado.data.total)
      } catch (error) {
        console.error("Error al cargar equipos:", error)
        toast.error("No se pudieron cargar los equipos")
      } finally {
        setLoading(false)
      }
    },
    [busqueda, page, pageSize]
  )

  useEffect(() => {
    const timeout = setTimeout(() => {
      cargarEquipos(1, pageSize, busqueda.trim())
    }, 400)

    return () => clearTimeout(timeout)
    // La búsqueda se aplica con debounce para evitar solicitudes por cada tecla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda])

  function handlePageChange(nuevaPagina: number) {
    void cargarEquipos(nuevaPagina, pageSize)
  }

  function handlePageSizeChange(nuevoTamano: number) {
    void cargarEquipos(1, nuevoTamano)
  }

  function handleNuevoEquipo() {
    setEquipoSeleccionado(null)
    setOpenForm(true)
  }

  function handleEditarEquipo(equipo: Equipo) {
    setEquipoSeleccionado(equipo)
    setOpenForm(true)
  }

  const handleSuccess = useCallback(async () => {
    setOpenForm(false)
    setEquipoSeleccionado(null)
    await cargarEquipos(page, pageSize)
  }, [cargarEquipos, page, pageSize])

  function handleOpenChange(open: boolean) {
    setOpenForm(open)
    if (!open) setEquipoSeleccionado(null)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="size-6" />
            <h1 className="text-2xl font-semibold tracking-tight">Equipos</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Administra los equipos y su estado operativo.
          </p>
        </div>

        <Button onClick={handleNuevoEquipo}>
          <Plus className="mr-2 size-4" />
          Nuevo equipo
        </Button>
      </div>

      <Dialog open={openForm} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {equipoSeleccionado ? "Editar equipo" : "Registrar equipo"}
            </DialogTitle>
          </DialogHeader>
          <EquipoForm
            key={equipoSeleccionado?.id ?? "nuevo"}
            equipo={equipoSeleccionado ?? undefined}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar por código, equipo, marca, modelo o placa..."
            className="pl-9"
            aria-label="Buscar equipos"
          />
        </div>

        <Button
          variant="outline"
          onClick={() => void cargarEquipos(page, pageSize)}
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`}
          />
          Actualizar
        </Button>
      </div>

      {loading ? (
        <div className="rounded-lg border p-8 text-center">
          <RefreshCw className="mx-auto size-5 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Cargando equipos...
          </p>
        </div>
      ) : (
        <EquipoTable
          equipos={equipos}
          onEdit={handleEditarEquipo}
          onRefresh={() => cargarEquipos(page, pageSize)}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          total={totalEquipos}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {!loading && (
        <div className="text-sm text-muted-foreground">
          Mostrando{" "}
          <span className="font-medium text-foreground">{equipos.length}</span>{" "}
          de <span className="font-medium text-foreground">{totalEquipos}</span>{" "}
          equipos.
        </div>
      )}
    </div>
  )
}
