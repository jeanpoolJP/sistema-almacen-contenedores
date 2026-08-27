"use client"

import { useEffect, useState } from "react"

import { RefreshCw } from "lucide-react"

import { obtenerDashboardAction } from "../dashboard.actions"

import type { DashboardData } from "../dashboard.types"

import { DashboardStatistics } from "./dashboard-statistics"
import { ActividadReciente } from "./actividad-reciente"
import { EstadoAlmacen } from "./estado-almacen"

import { Button } from "@/components/ui/button"

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)

  async function cargarDashboard() {
    setLoading(true)
    setError(null)

    try {
      const result = await obtenerDashboardAction()

      if (!result.success) {
        setError(result.message)
        return
      }

      setData(result.data)
    } catch {
      setError("No se pudo cargar la información del dashboard.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDashboard()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

          <p className="text-sm text-muted-foreground">
            Resumen general del almacén de contenedores.
          </p>
        </div>

        <div className="rounded-lg border p-8 text-center">
          <RefreshCw className="mx-auto size-6 animate-spin text-muted-foreground" />

          <p className="mt-3 text-sm text-muted-foreground">
            Cargando información...
          </p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

          <p className="text-sm text-muted-foreground">
            Resumen general del almacén de contenedores.
          </p>
        </div>

        <div className="rounded-lg border p-8 text-center">
          <p className="text-sm text-destructive">
            {error ?? "No se pudo cargar el dashboard."}
          </p>

          <Button variant="outline" className="mt-4" onClick={cargarDashboard}>
            <RefreshCw className="mr-2 size-4" />
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

          <p className="text-sm text-muted-foreground">
            Resumen general del almacén de contenedores.
          </p>
        </div>

        <Button variant="outline" onClick={cargarDashboard} disabled={loading}>
          <RefreshCw
            className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`}
          />
          Actualizar
        </Button>
      </div>

      {/* =====================================================
          ESTADÍSTICAS
      ====================================================== */}

      <DashboardStatistics statistics={data.statistics} />

      {/* =====================================================
          CONTENIDO
      ====================================================== */}

      <div className="grid gap-6 lg:grid-cols-2">
        <ActividadReciente actividades={data.actividades} />

        <EstadoAlmacen estado={data.estadoAlmacen} />
      </div>
    </div>
  )
}
