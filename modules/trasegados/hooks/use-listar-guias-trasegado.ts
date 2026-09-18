// modules\trasegados\hooks\use-listar-guias-trasegado.ts

"use client"

import { useCallback, useEffect, useState, useTransition } from "react"
import { toast } from "sonner"

import { listarGuiasTrasegadoAction } from "../actions/listar-guias-trasegado.action"
import type { ListarGuiasTrasegadoInput } from "../schemas/listar-guias-trasegado.schema"
import type { ListarGuiasTrasegadoResult } from "../types/guia-trasegado-listado.types"

/**
 * Hook que maneja:
 * - Filtros del listado
 * - Paginación
 * - Orden
 * - Llamada al server action
 * - Debounce en filtros de texto
 */
export function useListarGuiasTrasegado(
  filtrosIniciales?: Partial<ListarGuiasTrasegadoInput>
) {
  const [filtros, setFiltros] = useState<Partial<ListarGuiasTrasegadoInput>>({
    page: 1,
    pageSize: 20,
    ordenarPor: "fechaIngreso",
    orden: "desc",
    ...filtrosIniciales,
  })

  const [result, setResult] = useState<ListarGuiasTrasegadoResult | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // ------------------ FETCH ------------------
  const fetchData = useCallback(
    (filtrosActuales: Partial<ListarGuiasTrasegadoInput>) => {
      startTransition(async () => {
        setError(null)
        const res = await listarGuiasTrasegadoAction(filtrosActuales)
        if (!res.success) {
          setError(res.message)
          toast.error(res.message)
          return
        }
        setResult(res.data)
      })
    },
    []
  )

  // ------------------ DEBOUNCE ------------------
  // Para no llamar al backend en cada tecla, esperamos 400ms.
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(filtros)
    }, 400)
    return () => clearTimeout(timer)
  }, [filtros, fetchData])

  // ------------------ HELPERS ------------------
  const actualizarFiltro = useCallback(
    <K extends keyof ListarGuiasTrasegadoInput>(
      key: K,
      value: ListarGuiasTrasegadoInput[K] | undefined
    ) => {
      setFiltros((prev) => ({
        ...prev,
        [key]: value,
        // Cualquier cambio de filtro reinicia a la página 1
        page: key === "page" ? (value as number) : 1,
      }))
    },
    []
  )

  const limpiarFiltros = useCallback(() => {
    setFiltros({
      page: 1,
      pageSize: 20,
      ordenarPor: "fechaIngreso",
      orden: "desc",
    })
  }, [])

  const irAPagina = useCallback((page: number) => {
    setFiltros((prev) => ({ ...prev, page }))
  }, [])

  const cambiarOrden = useCallback(
    (ordenarPor: ListarGuiasTrasegadoInput["ordenarPor"]) => {
      setFiltros((prev) => ({
        ...prev,
        ordenarPor,
        orden:
          prev.ordenarPor === ordenarPor && prev.orden === "desc"
            ? "asc"
            : "desc",
      }))
    },
    []
  )

  const refetch = useCallback(() => {
    fetchData(filtros)
  }, [fetchData, filtros])

  return {
    filtros,
    result,
    isPending,
    error,
    actualizarFiltro,
    limpiarFiltros,
    irAPagina,
    cambiarOrden,
    refetch,
  }
}
