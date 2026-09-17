"use client"

import { useCallback, useState } from "react"

interface EntidadLookupState<T> {
  encontrada: boolean
  data: T | null
  buscando: boolean
  error: string | null
}

/**
 * Hook que encapsula la lógica de buscar una entidad por su clave
 * y exponer si existe (para bloquear campos) o no (para permitir crear).
 *
 * @param buscarFn Función server action que recibe la clave y devuelve
 *                 { found: true, data } | { found: false }.
 */
export function useEntidadLookup<TClave extends string, TData>(
  buscarFn: (
    clave: TClave
  ) => Promise<{ found: true; data: TData } | { found: false }>
) {
  const [state, setState] = useState<EntidadLookupState<TData>>({
    encontrada: false,
    data: null,
    buscando: false,
    error: null,
  })

  const buscar = useCallback(
    async (clave: TClave) => {
      const claveNormalizada = (clave ?? "").trim()

      if (!claveNormalizada) {
        setState({
          encontrada: false,
          data: null,
          buscando: false,
          error: null,
        })
        return
      }

      setState((s) => ({ ...s, buscando: true, error: null }))

      try {
        const result = await buscarFn(claveNormalizada as TClave)

        if (result.found) {
          setState({
            encontrada: true,
            data: result.data,
            buscando: false,
            error: null,
          })
        } else {
          setState({
            encontrada: false,
            data: null,
            buscando: false,
            error: null,
          })
        }
      } catch (e) {
        setState({
          encontrada: false,
          data: null,
          buscando: false,
          error: e instanceof Error ? e.message : "Error al buscar.",
        })
      }
    },
    [buscarFn]
  )

  const reset = useCallback(() => {
    setState({
      encontrada: false,
      data: null,
      buscando: false,
      error: null,
    })
  }, [])

  return { ...state, buscar, reset }
}
