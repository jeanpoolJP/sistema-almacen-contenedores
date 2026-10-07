/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useCallback, useEffect, useState } from "react"
import { Plus, RefreshCw, Search, UserRound } from "lucide-react"
import { toast } from "sonner"

import type { Operador } from "../operadores.types"
import { listarOperadores } from "../operadores.actions"
import { OperadorForm } from "./operador-form"
import { OperadorTable } from "./operador-table"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function OperadoresPage() {
  const [operadores, setOperadores] = useState<Operador[]>([])
  const [operadorSeleccionado, setOperadorSeleccionado] =
    useState<Operador | null>(null)
  const [openForm, setOpenForm] = useState(false)
  const [busqueda, setBusqueda] = useState("")
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOperadores, setTotalOperadores] = useState(0)

  const cargarOperadores = useCallback(
    async (
      pagina: number = page,
      cantidad: number = pageSize,
      termino: string = busqueda
    ) => {
      setLoading(true)

      try {
        const result = await listarOperadores({
          pagina,
          porPagina: cantidad,
          busqueda: termino,
          estado: "todos",
        })

        if (!result.success) {
          toast.error(result.error)
          return
        }

        setOperadores(result.data.operadores)
        setPage(result.data.pagina)
        setPageSize(result.data.porPagina)
        setTotalPages(result.data.totalPaginas)
        setTotalOperadores(result.data.total)
      } catch (error) {
        console.error("Error al cargar operadores:", error)
        toast.error("No se pudieron cargar los operadores")
      } finally {
        setLoading(false)
      }
    },
    [busqueda, page, pageSize]
  )

  useEffect(() => {
    const timeout = setTimeout(() => {
      cargarOperadores(1, pageSize, busqueda.trim())
    }, 400)

    return () => clearTimeout(timeout)
    // La búsqueda se aplica con un debounce para evitar solicitudes por cada tecla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda])

  function handlePageChange(nuevaPagina: number) {
    void cargarOperadores(nuevaPagina, pageSize)
  }

  function handlePageSizeChange(nuevoTamano: number) {
    void cargarOperadores(1, nuevoTamano)
  }

  function handleNuevoOperador() {
    setOperadorSeleccionado(null)
    setOpenForm(true)
  }

  function handleEditarOperador(operador: Operador) {
    setOperadorSeleccionado(operador)
    setOpenForm(true)
  }

  const handleSuccess = useCallback(async () => {
    setOpenForm(false)
    setOperadorSeleccionado(null)
    await cargarOperadores(page, pageSize)
  }, [cargarOperadores, page, pageSize])

  function handleOpenChange(open: boolean) {
    setOpenForm(open)

    if (!open) setOperadorSeleccionado(null)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <UserRound className="size-6" />
            <h1 className="text-2xl font-semibold tracking-tight">
              Operadores
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Administra los operadores registrados en el sistema.
          </p>
        </div>

        <Button onClick={handleNuevoOperador}>
          <Plus className="mr-2 size-4" />
          Nuevo operador
        </Button>
      </div>

      <Dialog open={openForm} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {operadorSeleccionado ? "Editar operador" : "Registrar operador"}
            </DialogTitle>
          </DialogHeader>

          <OperadorForm
            key={operadorSeleccionado?.id ?? "nuevo"}
            operador={operadorSeleccionado ?? undefined}
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
            placeholder="Buscar por nombre, documento, teléfono o licencia..."
            className="pl-9"
            aria-label="Buscar operadores"
          />
        </div>

        <Button
          variant="outline"
          onClick={() => void cargarOperadores(page, pageSize)}
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
            Cargando operadores...
          </p>
        </div>
      ) : (
        <OperadorTable
          operadores={operadores}
          onEdit={handleEditarOperador}
          onRefresh={() => cargarOperadores(page, pageSize)}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          total={totalOperadores}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {!loading && (
        <div className="text-sm text-muted-foreground">
          Mostrando{" "}
          <span className="font-medium text-foreground">
            {operadores.length}
          </span>{" "}
          de{" "}
          <span className="font-medium text-foreground">{totalOperadores}</span>{" "}
          operadores.
        </div>
      )}
    </div>
  )
}
