"use client"

import {
  ClipboardListIcon,
  Loader2Icon,
  PlusIcon,
  SearchIcon,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EstadoPagoBadge } from "@/modules/guias/components/estado-pago-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  listarGuiasAlquilerAction,
  obtenerOpcionesAlquilerAction,
} from "../actions/control-alquiler.actions"
import { AsignarClienteDialog } from "./asignar-cliente-dialog"
import { AsignarCotizacionDialog } from "./asignar-cotizacion-dialog"
import { GuiaAlquilerAccionesMenu } from "./guia-alquiler-acciones-menu"
import { GuiaAlquilerDetalleDialog } from "./guia-alquiler-detalle-dialog"
import { GuiaAlquilerFormDialog } from "./guia-alquiler-form-dialog"
import { RegistrarPagoDialog } from "./registrar-pago-dialog"

type SuccessData<T> = T extends { success: true; data: infer Data }
  ? Data
  : never
type Opciones = SuccessData<
  Awaited<ReturnType<typeof obtenerOpcionesAlquilerAction>>
>
type ResultadoListado = SuccessData<
  Awaited<ReturnType<typeof listarGuiasAlquilerAction>>
>
type Guia = ResultadoListado["items"][number]

type DialogState<T> = { open: boolean; guia: T | null }

const ESTADO_CONFIG: Record<
  Guia["estado"],
  { etiqueta: string; className: string }
> = {
  EN_PROCESO: {
    etiqueta: "En proceso",
    className:
      "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
  },
  FINALIZADO: {
    etiqueta: "Finalizado",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  },
  ANULADO: {
    etiqueta: "Anulado",
    className:
      "border-red-200 bg-red-50 text-red-700 hover:bg-red-50 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
  },
}

function fechaCorta(fecha: string) {
  const [year, month, day] = fecha.split("-")
  return `${day}/${month}/${year}`
}

export function ControlAlquilerView() {
  const router = useRouter()
  const [opciones, setOpciones] = useState<Opciones | null>(null)
  const [resultado, setResultado] = useState<ResultadoListado | null>(null)
  const [cargando, startListadoTransition] = useTransition()
  const [cargandoOpciones, startOpcionesTransition] = useTransition()
  const [errorListado, setErrorListado] = useState<string | null>(null)
  const [pagina, setPagina] = useState(1)
  const [busquedaIngresada, setBusquedaIngresada] = useState("")
  const [busqueda, setBusqueda] = useState("")
  const solicitudListadoRef = useRef(0)
  const [formGuia, setFormGuia] = useState<DialogState<Guia>>({
    open: false,
    guia: null,
  })
  const [clienteGuia, setClienteGuia] = useState<DialogState<Guia>>({
    open: false,
    guia: null,
  })
  const [cotizacionGuia, setCotizacionGuia] = useState<DialogState<Guia>>({
    open: false,
    guia: null,
  })
  const [detalleGuia, setDetalleGuia] = useState<DialogState<Guia>>({
    open: false,
    guia: null,
  })
  const [pagoGuia, setPagoGuia] = useState<DialogState<Guia>>({
    open: false,
    guia: null,
  })

  useEffect(() => {
    let vigente = true
    startOpcionesTransition(async () => {
      try {
        const response = await obtenerOpcionesAlquilerAction()
        if (!vigente) return
        if (!response.success) {
          toast.error(response.message)
          return
        }
        setOpciones(response.data)
      } catch (error) {
        console.error("[ControlAlquilerView:opciones]", error)
        if (vigente) {
          toast.error(
            "No se pudieron cargar los equipos, operadores y clientes."
          )
        }
      }
    })

    return () => {
      vigente = false
    }
  }, [startOpcionesTransition])

  const cargarListado = useCallback(async () => {
    const solicitud = ++solicitudListadoRef.current
    startListadoTransition(async () => {
      setErrorListado(null)
      try {
        const response = await listarGuiasAlquilerAction({
          pagina,
          limite: 20,
          busqueda,
        })

        if (solicitud !== solicitudListadoRef.current) return
        if (!response.success) {
          startListadoTransition(() => setErrorListado(response.message))
          return
        }
        startListadoTransition(() => setResultado(response.data))
      } catch (error) {
        console.error("[ControlAlquilerView:listado]", error)
        if (solicitud === solicitudListadoRef.current) {
          startListadoTransition(() =>
            setErrorListado("No se pudieron cargar las guías de alquiler.")
          )
        }
      }
    })
  }, [busqueda, pagina, startListadoTransition])

  useEffect(() => {
    void cargarListado()
    return () => {
      solicitudListadoRef.current += 1
    }
  }, [cargarListado])

  function refrescar() {
    router.refresh()
    void cargarListado()
  }

  function buscar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPagina(1)
    setBusqueda(busquedaIngresada.trim())
  }

  const listado = resultado?.items ?? []

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <ClipboardListIcon className="size-6" />
            Control de alquiler
          </h1>
          <p className="text-sm text-muted-foreground">
            Registra guías de servicio, asigna clientes y administra sus
            cotizaciones.
          </p>
        </div>
        <Button
          onClick={() => setFormGuia({ open: true, guia: null })}
          disabled={cargandoOpciones || !opciones}
        >
          {cargandoOpciones ? (
            <Loader2Icon className="mr-2 size-4 animate-spin" />
          ) : (
            <PlusIcon className="mr-2 size-4" />
          )}
          Nueva guía
        </Button>
      </header>

      <form onSubmit={buscar} className="flex max-w-xl gap-2">
        <Input
          value={busquedaIngresada}
          onChange={(event) => setBusquedaIngresada(event.target.value)}
          placeholder="Buscar por guía, solicitante, cliente, equipo o cotización"
          aria-label="Buscar guías de alquiler"
        />
        <Button type="submit" variant="outline" aria-label="Buscar">
          <SearchIcon className="size-4" />
        </Button>
      </form>

      <div className="w-full overflow-x-auto rounded-lg border bg-card">
        <Table className="min-w-[980px] lg:table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[8%]">N.° guía</TableHead>
              <TableHead className="w-[19%]">Cliente</TableHead>
              <TableHead className="w-[19%]">Máquina / operador</TableHead>
              <TableHead className="w-[15%]">Fecha</TableHead>
              <TableHead className="w-[12%]">Estado</TableHead>
              <TableHead className="w-[12%]">Pago</TableHead>
              <TableHead className="w-[11%]">Cotización</TableHead>
              <TableHead className="w-[4%]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {cargando ? (
              <TableRow>
                <TableCell colSpan={8} className="h-28 text-center">
                  <Loader2Icon className="mx-auto size-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : errorListado ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-28 text-center text-destructive"
                >
                  {errorListado}
                </TableCell>
              </TableRow>
            ) : listado.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-28 text-center text-muted-foreground"
                >
                  No hay guías para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              listado.map((guia) => (
                <TableRow key={guia.id}>
                  <TableCell className="font-mono font-medium">
                    {guia.numeroGuia}
                  </TableCell>
                  <TableCell>
                    {guia.cliente ? (
                      <>
                        <div className="max-w-52 truncate font-medium">
                          {guia.cliente.nombreCompleto || "Sin nombre"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {guia.cliente.tipoDocumento}{" "}
                          {guia.cliente.numeroDocumento}
                        </div>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Sin cliente
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="min-w-0">
                    <p
                      className="truncate text-sm font-medium"
                      title={guia.equipo.nombre}
                    >
                      {guia.equipo.nombre}
                    </p>
                    <p
                      className="truncate text-xs text-muted-foreground"
                      title={`${guia.operador.nombres} ${guia.operador.apellidos}`}
                    >
                      {guia.operador.nombres} {guia.operador.apellidos}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    <p>{fechaCorta(guia.fechaInicio)}</p>
                    <p className="text-xs text-muted-foreground">
                      {fechaCorta(guia.fechaFin)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={ESTADO_CONFIG[guia.estado].className}
                    >
                      {ESTADO_CONFIG[guia.estado].etiqueta}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <EstadoPagoBadge estado={guia.estadoPago} />
                  </TableCell>
                  <TableCell>
                    {guia.numeroCotizacion ? (
                      <>
                        <div className="font-medium">
                          {guia.numeroCotizacion}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {guia.total === null
                            ? "Sin monto"
                            : `S/ ${guia.total.toFixed(2)}`}
                        </div>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        —
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <GuiaAlquilerAccionesMenu
                      guia={guia}
                      onVerDetalle={() => setDetalleGuia({ open: true, guia })}
                      onEditar={() => setFormGuia({ open: true, guia })}
                      onAsignarCliente={() =>
                        setClienteGuia({ open: true, guia })
                      }
                      onAsignarCotizacion={() =>
                        setCotizacionGuia({ open: true, guia })
                      }
                      onRegistrarPago={() => setPagoGuia({ open: true, guia })}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <footer className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">
          {resultado
            ? `${resultado.total} guía${resultado.total === 1 ? "" : "s"} · página ${resultado.pagina} de ${resultado.totalPaginas}`
            : ""}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagina((actual) => Math.max(1, actual - 1))}
            disabled={cargando || pagina <= 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPagina((actual) =>
                Math.min(resultado?.totalPaginas ?? actual, actual + 1)
              )
            }
            disabled={cargando || pagina >= (resultado?.totalPaginas ?? 1)}
          >
            Siguiente
          </Button>
        </div>
      </footer>

      <GuiaAlquilerFormDialog
        open={formGuia.open}
        onOpenChange={(open) => setFormGuia((actual) => ({ ...actual, open }))}
        guia={formGuia.guia}
        opciones={opciones}
        onSuccess={refrescar}
      />

      {clienteGuia.open && clienteGuia.guia && opciones && (
        <AsignarClienteDialog
          open={clienteGuia.open}
          onOpenChange={(open) => {
            if (!open) setClienteGuia({ open: false, guia: null })
          }}
          guiaId={clienteGuia.guia.id}
          numeroGuia={clienteGuia.guia.numeroGuia}
          clienteActual={clienteGuia.guia.cliente}
          clientesFrecuentes={opciones.clientes}
          onSuccess={refrescar}
        />
      )}

      {cotizacionGuia.open && cotizacionGuia.guia && (
        <AsignarCotizacionDialog
          open={cotizacionGuia.open}
          onOpenChange={(open) => {
            if (!open) setCotizacionGuia({ open: false, guia: null })
          }}
          guiaId={cotizacionGuia.guia.id}
          numeroGuia={cotizacionGuia.guia.numeroGuia}
          numeroCotizacion={cotizacionGuia.guia.numeroCotizacion}
          subtotal={cotizacionGuia.guia.subtotal}
          total={cotizacionGuia.guia.total}
          modoIGVCotizacion={cotizacionGuia.guia.modoIGVCotizacion}
          onSuccess={refrescar}
        />
      )}

      <GuiaAlquilerDetalleDialog
        guia={detalleGuia.guia}
        open={detalleGuia.open}
        onOpenChange={(open) =>
          setDetalleGuia((actual) => ({ ...actual, open }))
        }
      />

      <RegistrarPagoDialog
        guia={pagoGuia.guia}
        open={pagoGuia.open}
        onOpenChange={(open) => setPagoGuia((actual) => ({ ...actual, open }))}
        onSuccess={refrescar}
      />
    </div>
  )
}
