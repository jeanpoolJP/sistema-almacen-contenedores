"use client"

import {
  ArrowLeftIcon,
  BadgeCheckIcon,
  ChartNoAxesCombinedIcon,
  Clock3Icon,
  FilesIcon,
  HandCoinsIcon,
  LoaderCircleIcon,
} from "lucide-react"
import Link from "next/link"
import { useRef, useState, useTransition } from "react"
import { toast } from "sonner"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

import { obtenerEstadisticasTrasegadoAction } from "../../actions/estadisticas-trasegado.action"
import {
  PERIODOS_ESTADISTICAS_TRASEGADO,
  type EstadisticasTrasegado,
  type FiltroEstadisticasTrasegado,
  type PeriodoEstadisticasTrasegado,
} from "../../types/estadisticas-trasegado.types"
import { IngresosMensualesChart } from "./ingresos-mensuales-chart"

interface EstadisticasTrasegadoViewProps {
  initialData: EstadisticasTrasegado
}

const ETIQUETAS_PERIODO: Record<PeriodoEstadisticasTrasegado, string> = {
  HISTORIAL: "Todo el historial",
  HOY: "Hoy",
  SEMANA: "Esta semana",
  MES: "Este mes",
  MES_PASADO: "Mes pasado",
  ANIO: "Este año",
  RANGO: "Rango de fechas",
}

const PERIODOS_RAPIDOS = PERIODOS_ESTADISTICAS_TRASEGADO.filter(
  (periodo) => periodo !== "RANGO"
)

const TARJETAS = [
  {
    titulo: "Guías totales",
    clave: "guiasTotales",
    tipo: "cantidad",
    detalle: "Ingresadas en el periodo",
    icono: FilesIcon,
    color: "text-sky-700 bg-sky-500/10",
  },
  {
    titulo: "Guías finalizadas",
    clave: "guiasFinalizadas",
    tipo: "cantidad",
    detalle: "Ingresadas en el periodo",
    icono: BadgeCheckIcon,
    color: "text-emerald-700 bg-emerald-500/10",
  },
  {
    titulo: "Guías en proceso",
    clave: "guiasEnProceso",
    tipo: "cantidad",
    detalle: "Ingresadas en el periodo",
    icono: LoaderCircleIcon,
    color: "text-amber-700 bg-amber-500/10",
  },
  {
    titulo: "Total generado",
    clave: "totalGenerado",
    tipo: "moneda",
    detalle: "Importe total de las cotizaciones",
    icono: ChartNoAxesCombinedIcon,
    color: "text-cyan-700 bg-cyan-500/10",
  },
  {
    titulo: "Total cobrado",
    clave: "totalCobrado",
    tipo: "moneda",
    detalle: "Guías con pago registrado",
    icono: HandCoinsIcon,
    color: "text-teal-700 bg-teal-500/10",
  },
  {
    titulo: "Total pendiente",
    clave: "totalPendiente",
    tipo: "moneda",
    detalle: "Guías pendientes de pago",
    icono: Clock3Icon,
    color: "text-orange-700 bg-orange-500/10",
  },
] as const

function formatearMoneda(valor: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(valor)
}

export function EstadisticasTrasegadoView({
  initialData,
}: EstadisticasTrasegadoViewProps) {
  const [periodo, setPeriodo] = useState<PeriodoEstadisticasTrasegado>(
    initialData.periodo
  )
  const [fechaDesde, setFechaDesde] = useState("")
  const [fechaHasta, setFechaHasta] = useState("")
  const [data, setData] = useState(initialData)
  const [isPending, startTransition] = useTransition()
  const solicitudActual = useRef(0)

  function consultar(filtro: FiltroEstadisticasTrasegado) {
    const idSolicitud = ++solicitudActual.current

    startTransition(async () => {
      const resultado = await obtenerEstadisticasTrasegadoAction(filtro)
      if (idSolicitud !== solicitudActual.current) return

      if (!resultado.success) {
        toast.error(resultado.message)
        return
      }

      setData(resultado.data)
    })
  }

  function seleccionarPeriodo(nuevoPeriodo: PeriodoEstadisticasTrasegado) {
    setPeriodo(nuevoPeriodo)

    if (nuevoPeriodo === "RANGO") {
      if (fechaDesde && fechaHasta && fechaDesde <= fechaHasta) {
        consultar({ periodo: "RANGO", fechaDesde, fechaHasta })
      }
      return
    }

    consultar({ periodo: nuevoPeriodo })
  }

  function actualizarRango(nuevoDesde: string, nuevoHasta: string) {
    setFechaDesde(nuevoDesde)
    setFechaHasta(nuevoHasta)

    if (
      periodo === "RANGO" &&
      nuevoDesde &&
      nuevoHasta &&
      nuevoDesde <= nuevoHasta
    ) {
      consultar({
        periodo: "RANGO",
        fechaDesde: nuevoDesde,
        fechaHasta: nuevoHasta,
      })
    }
  }

  const rangoInvalido = Boolean(
    fechaDesde && fechaHasta && fechaDesde > fechaHasta
  )

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Link
            href="/admin/trasegados"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "-ml-3 w-fit"
            )}
          >
            <ArrowLeftIcon className="mr-2 size-4" />
            Volver a guías
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Estadísticas de trasegados
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Indicadores calculados según la fecha de ingreso de cada guía.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {isPending && (
            <p className="text-right text-xs text-muted-foreground">
              Actualizando estadísticas...
            </p>
          )}
          <div
            role="group"
            aria-label="Filtrar estadísticas por periodo"
            className="flex max-w-full gap-2 overflow-x-auto pb-1"
          >
            {PERIODOS_RAPIDOS.map((opcion) => (
              <Button
                key={opcion}
                type="button"
                size="sm"
                variant={periodo === opcion ? "default" : "outline"}
                aria-pressed={periodo === opcion}
                onClick={() => seleccionarPeriodo(opcion)}
                className="shrink-0"
              >
                {ETIQUETAS_PERIODO[opcion]}
              </Button>
            ))}
            <Button
              type="button"
              size="sm"
              variant={periodo === "RANGO" ? "default" : "outline"}
              aria-pressed={periodo === "RANGO"}
              onClick={() => seleccionarPeriodo("RANGO")}
              className="shrink-0"
            >
              {ETIQUETAS_PERIODO.RANGO}
            </Button>
          </div>

          {periodo === "RANGO" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="estadisticas-desde">Desde</Label>
                <Input
                  id="estadisticas-desde"
                  type="date"
                  value={fechaDesde}
                  max={fechaHasta || undefined}
                  onChange={(event) =>
                    actualizarRango(event.target.value, fechaHasta)
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="estadisticas-hasta">Hasta</Label>
                <Input
                  id="estadisticas-hasta"
                  type="date"
                  value={fechaHasta}
                  min={fechaDesde || undefined}
                  onChange={(event) =>
                    actualizarRango(fechaDesde, event.target.value)
                  }
                />
              </div>
              {rangoInvalido && (
                <p className="text-sm text-destructive sm:col-span-2">
                  La fecha final debe ser igual o posterior a la inicial.
                </p>
              )}
              {(!fechaDesde || !fechaHasta) && (
                <p className="text-xs text-muted-foreground sm:col-span-2">
                  Selecciona ambas fechas para consultar el rango.
                </p>
              )}
            </div>
          )}
        </div>
      </header>

      <section
        aria-label="Indicadores de trasegados"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {TARJETAS.map((tarjeta) => {
          const valor = data[tarjeta.clave]

          return (
            <Card key={tarjeta.clave}>
              <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {tarjeta.titulo}
                </CardTitle>
                <span className={cn("rounded-md p-2", tarjeta.color)}>
                  <tarjeta.icono className="size-4" />
                </span>
              </CardHeader>
              <CardContent>
                {isPending ? (
                  <Skeleton className="mb-2 h-8 w-32" />
                ) : (
                  <p className="text-2xl font-semibold tabular-nums">
                    {tarjeta.tipo === "moneda"
                      ? formatearMoneda(Number(valor))
                      : Number(valor).toLocaleString("es-PE")}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {tarjeta.detalle}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <IngresosMensualesChart data={data.ingresosMensuales} />
    </div>
  )
}
