// modules\movimientos\components\reporte-movimientos.tsx

"use client"

import { useEffect, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  LoaderCircle,
  Search,
} from "lucide-react"
import { formatInTimeZone } from "date-fns-tz"
import { toast } from "sonner"
import { exportarExcel } from "@/lib/exportar-excel"
import { APP_TIMEZONE } from "@/lib/date/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { consultarMovimientosAction } from "../actions/movimientos.actions"
import type {
  MovimientoItem,
  OrigenMovimiento,
  ReporteMovimientos,
  TipoMovimiento,
} from "../types/movimientos.types"

const filtrosIniciales = {
  tipo: "TODOS",
  origen: "TODOS",
} as const

function exportarReporte(
  movimientos: MovimientoItem[],
  desde: string,
  hasta: string
) {
  const periodoArchivo =
    desde && hasta
      ? `${desde}_${hasta}`
      : desde
        ? `desde_${desde}`
        : hasta
          ? `hasta_${hasta}`
          : "Todo_el_historial"
  const periodoTexto =
    desde || hasta
      ? `Periodo: ${desde || "inicio"} al ${hasta || "actualidad"}`
      : "Periodo: Todo el historial"

  exportarExcel({
    datos: movimientos.map((movimiento) => ({
      Fecha: movimiento.fecha,
      Hora: movimiento.hora,
      Movimiento: movimiento.tipo === "INGRESO" ? "Ingreso" : "Salida",
      Origen:
        movimiento.origen === "INTERNAMIENTO" ? "Internamiento" : "Trasegado",
      Guía: movimiento.guia,
      Elemento: movimiento.elemento,
      Cliente: movimiento.cliente,
    })),
    nombreArchivo: `Movimientos_${periodoArchivo}`,
    nombreHoja: "Movimientos",
    titulo: "Reporte de movimientos del almacén",
    subtitulo: periodoTexto,
    anchos: [14, 12, 16, 18, 18, 38, 32],
  })
}

export function ReporteMovimientos() {
  const [desde, setDesde] = useState("")
  const [hasta, setHasta] = useState("")
  const [reporte, setReporte] = useState<ReporteMovimientos | null>(null)
  const [cargando, setCargando] = useState(true)
  const [tipo, setTipo] = useState<TipoMovimiento | "TODOS">(
    filtrosIniciales.tipo
  )
  const [origen, setOrigen] = useState<OrigenMovimiento | "TODOS">(
    filtrosIniciales.origen
  )
  const [pagina, setPagina] = useState(1)
  const [filasPorPagina, setFilasPorPagina] = useState(25)

  useEffect(() => {
    let vigente = true

    async function cargarReporteInicial() {
      try {
        const resultado = await consultarMovimientosAction({
          desde: "",
          hasta: "",
        })
        if (!vigente) return

        if (!resultado.success) {
          toast.error(resultado.error)
          return
        }

        setReporte(resultado.data)
      } catch {
        if (vigente) {
          toast.error("Ocurrió un error al cargar los movimientos.")
        }
      } finally {
        if (vigente) setCargando(false)
      }
    }

    void cargarReporteInicial()
    return () => {
      vigente = false
    }
  }, [])

  async function consultar(rangoDesde = desde, rangoHasta = hasta) {
    setDesde(rangoDesde)
    setHasta(rangoHasta)
    setCargando(true)
    try {
      const resultado = await consultarMovimientosAction({
        desde: rangoDesde || "",
        hasta: rangoHasta || "",
      })
      if (!resultado.success) {
        toast.error(resultado.error)
        return
      }
      setReporte(resultado.data)
      setPagina(1)
    } catch {
      toast.error("Ocurrió un error al consultar los movimientos.")
    } finally {
      setCargando(false)
    }
  }

  function consultarPeriodo(
    periodo: "HOY" | "SEMANA" | "MES" | "MES_ANTERIOR"
  ) {
    const hoy = formatInTimeZone(new Date(), APP_TIMEZONE, "yyyy-MM-dd")
    const fechaHoy = new Date(`${hoy}T00:00:00.000Z`)

    if (periodo === "HOY") {
      void consultar(hoy, hoy)
      return
    }

    if (periodo === "MES") {
      void consultar(`${hoy.slice(0, 7)}-01`, hoy)
      return
    }

    if (periodo === "MES_ANTERIOR") {
      const inicioMesActual = new Date(
        Date.UTC(fechaHoy.getUTCFullYear(), fechaHoy.getUTCMonth(), 1)
      )
      const ultimoDiaMesAnterior = new Date(inicioMesActual)
      ultimoDiaMesAnterior.setUTCDate(0)
      const inicioMesAnterior = new Date(
        Date.UTC(
          ultimoDiaMesAnterior.getUTCFullYear(),
          ultimoDiaMesAnterior.getUTCMonth(),
          1
        )
      )
      void consultar(
        inicioMesAnterior.toISOString().slice(0, 10),
        ultimoDiaMesAnterior.toISOString().slice(0, 10)
      )
      return
    }

    const diasDesdeLunes = (fechaHoy.getUTCDay() + 6) % 7
    fechaHoy.setUTCDate(fechaHoy.getUTCDate() - diasDesdeLunes)
    void consultar(fechaHoy.toISOString().slice(0, 10), hoy)
  }

  const movimientosFiltrados =
    reporte?.movimientos.filter(
      (movimiento) =>
        (tipo === "TODOS" || movimiento.tipo === tipo) &&
        (origen === "TODOS" || movimiento.origen === origen)
    ) ?? []

  const totalPaginas = Math.max(
    1,
    Math.ceil(movimientosFiltrados.length / filasPorPagina)
  )
  const inicioPagina = (pagina - 1) * filasPorPagina
  const movimientosVisibles = movimientosFiltrados.slice(
    inicioPagina,
    inicioPagina + filasPorPagina
  )
  const ingresosFiltrados = movimientosFiltrados.filter(
    (movimiento) => movimiento.tipo === "INGRESO"
  ).length
  const salidasFiltradas = movimientosFiltrados.length - ingresosFiltrados
  const totalInternamientos = movimientosFiltrados.filter(
    (movimiento) => movimiento.origen === "INTERNAMIENTO"
  ).length
  const totalTrasegados = movimientosFiltrados.length - totalInternamientos

  const tarjetas = reporte
    ? [
        {
          titulo: "Ingresos",
          valor: ingresosFiltrados,
          color: "text-emerald-700",
        },
        {
          titulo: "Salidas",
          valor: salidasFiltradas,
          color: "text-rose-700",
        },
        {
          titulo: "Balance neto",
          valor: ingresosFiltrados - salidasFiltradas,
          color: "text-foreground",
        },
        {
          titulo: "Movimientos",
          valor: movimientosFiltrados.length,
          color: "text-foreground",
        },
      ]
    : []

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={cargando}
          onClick={() => {
            setTipo("TODOS")
            setOrigen("TODOS")
            setPagina(1)
            void consultar("", "")
          }}
        >
          Todo el historial
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={cargando}
          onClick={() => consultarPeriodo("HOY")}
        >
          Hoy
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={cargando}
          onClick={() => consultarPeriodo("SEMANA")}
        >
          Esta semana
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={cargando}
          onClick={() => consultarPeriodo("MES")}
        >
          Este mes
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={cargando}
          onClick={() => consultarPeriodo("MES_ANTERIOR")}
        >
          Mes pasado
        </Button>
      </div>
      <form
        className="flex flex-wrap items-end gap-3 border-b pb-5"
        onSubmit={(event) => {
          event.preventDefault()
          void consultar()
        }}
      >
        <label className="grid gap-1.5 text-sm font-medium">
          Desde
          <Input
            type="date"
            value={desde}
            max={hasta || undefined}
            onChange={(event) => setDesde(event.target.value)}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Hasta
          <Input
            type="date"
            value={hasta}
            min={desde || undefined}
            onChange={(event) => setHasta(event.target.value)}
          />
        </label>
        <Button type="submit" disabled={cargando}>
          {cargando ? <LoaderCircle className="animate-spin" /> : <Search />}
          Consultar
        </Button>
      </form>

      {reporte && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {tarjetas.map((tarjeta) => (
              <div
                key={tarjeta.titulo}
                className="border-l-2 border-primary px-4 py-2"
              >
                <p className="text-sm text-muted-foreground">
                  {tarjeta.titulo}
                </p>
                <p
                  className={`mt-1 text-2xl font-semibold tabular-nums ${tarjeta.color}`}
                >
                  {tarjeta.valor}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3 border-y py-4">
            <div className="flex flex-wrap gap-3">
              <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                Movimiento
                <select
                  className="h-9 min-w-36 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                  value={tipo}
                  onChange={(event) => {
                    setTipo(event.target.value as TipoMovimiento | "TODOS")
                    setPagina(1)
                  }}
                >
                  <option value="TODOS">Todos</option>
                  <option value="INGRESO">Ingresos</option>
                  <option value="SALIDA">Salidas</option>
                </select>
              </label>
              <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                Origen
                <select
                  className="h-9 min-w-40 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                  value={origen}
                  onChange={(event) => {
                    setOrigen(event.target.value as OrigenMovimiento | "TODOS")
                    setPagina(1)
                  }}
                >
                  <option value="TODOS">Todos</option>
                  <option value="INTERNAMIENTO">Internamiento</option>
                  <option value="TRASEGADO">Trasegado</option>
                </select>
              </label>
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={movimientosFiltrados.length === 0}
              onClick={() =>
                exportarReporte(
                  movimientosFiltrados,
                  reporte.desde,
                  reporte.hasta
                )
              }
            >
              <Download />
              Exportar Excel
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground uppercase">
                  <th className="px-3 py-3 font-medium">Fecha</th>
                  <th className="px-3 py-3 font-medium">Hora</th>
                  <th className="px-3 py-3 font-medium">Movimiento</th>
                  <th className="px-3 py-3 font-medium">Origen</th>
                  <th className="px-3 py-3 font-medium">Guía</th>
                  <th className="px-3 py-3 font-medium">Elemento</th>
                  <th className="px-3 py-3 font-medium">Cliente</th>
                </tr>
              </thead>
              <tbody>
                {movimientosVisibles.map((movimiento) => (
                  <tr key={movimiento.id} className="border-b last:border-0">
                    <td className="px-3 py-3 whitespace-nowrap tabular-nums">
                      {movimiento.fecha}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap tabular-nums">
                      {movimiento.hora}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={
                          movimiento.tipo === "INGRESO"
                            ? "font-medium text-emerald-700"
                            : "font-medium text-rose-700"
                        }
                      >
                        {movimiento.tipo === "INGRESO" ? "Ingreso" : "Salida"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {movimiento.origen === "INTERNAMIENTO"
                        ? "Internamiento"
                        : "Trasegado"}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs">
                      {movimiento.guia}
                    </td>
                    <td className="px-3 py-3">{movimiento.elemento}</td>
                    <td className="px-3 py-3">{movimiento.cliente}</td>
                  </tr>
                ))}
                {movimientosFiltrados.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-12 text-center text-muted-foreground"
                    >
                      No hay movimientos para los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
              <span>
                {movimientosFiltrados.length === 0
                  ? "0 movimientos"
                  : `Mostrando ${inicioPagina + 1}-${Math.min(
                      inicioPagina + filasPorPagina,
                      movimientosFiltrados.length
                    )} de ${movimientosFiltrados.length}`}
              </span>
              <span>
                Internamiento: {totalInternamientos} · Trasegado:{" "}
                {totalTrasegados}
              </span>
              <label className="flex items-center gap-2">
                Filas
                <select
                  className="h-8 rounded-md border border-input bg-background px-2 text-foreground"
                  value={filasPorPagina}
                  onChange={(event) => {
                    setFilasPorPagina(Number(event.target.value))
                    setPagina(1)
                  }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <span className="mr-1 text-sm text-muted-foreground">
                Página {pagina} de {totalPaginas}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pagina <= 1}
                aria-label="Página anterior"
                onClick={() => setPagina((actual) => Math.max(1, actual - 1))}
              >
                <ChevronLeft />
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pagina >= totalPaginas}
                aria-label="Página siguiente"
                onClick={() =>
                  setPagina((actual) => Math.min(totalPaginas, actual + 1))
                }
              >
                Siguiente
                <ChevronRight />
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
