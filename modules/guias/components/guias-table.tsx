// modules/guias/components/guias-table.tsx

"use client"

import { useEffect, useState, useTransition } from "react"

import { format } from "date-fns"
import { es } from "date-fns/locale"

import { CreditCard } from "lucide-react"
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Loader2,
  LogOut,
  MoreHorizontal,
  Search,
  X,
} from "lucide-react"

import { toast } from "sonner"

import { Input } from "@/components/ui/input"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { EstadoBadge } from "./estado-badge"
import { EstadoPagoBadge } from "./estado-pago-badge"

import { GuiaDetalleSheet } from "./guia-detalle-sheet"

import { RegistrarSalidaDialog } from "./registrar-salida-dialog"
import { RegistrarPagoDialog } from "./registrar-pago-dialog"

import type { GuiaConRelaciones } from "./guia-con-relaciones.type"

import type {
  EstadoGuia,
  EstadoPago,
  TratamientoIGV,
} from "@/lib/generated/prisma"

import { anularGuiaAction, obtenerGuiasAction } from "../guia.actions"

import { exportarExcel } from "@/lib/exportar-excel"

/**
 * ============================================================
 * FORMATEAR FECHA DE NEGOCIO
 * ============================================================
 */

function formatFechaNegocio(fecha: Date | string | null | undefined) {
  if (!fecha) return "—"

  const fechaDate = typeof fecha === "string" ? new Date(fecha) : fecha

  const año = fechaDate.getUTCFullYear()

  const mes = fechaDate.getUTCMonth()

  const dia = fechaDate.getUTCDate()

  const fechaLocal = new Date(año, mes, dia)

  return format(fechaLocal, "dd MMM yyyy", {
    locale: es,
  })
}

/**
 * ============================================================
 * PROPS
 * ============================================================
 */

type GuiasTableProps = {
  data: {
    guias: GuiaConRelaciones[]

    total: number

    pagina: number

    limite: number

    totalPaginas: number
  }

  onCambio?: () => void
}

/**
 * ============================================================
 * COMPONENTE
 * ============================================================
 */

export function GuiasTable({ data, onCambio }: GuiasTableProps) {
  /**
   * ==========================================================
   * DATOS
   * ==========================================================
   */

  const [guias, setGuias] = useState<GuiaConRelaciones[]>(data.guias)

  const [total, setTotal] = useState(data.total)

  const [pagina, setPagina] = useState(data.pagina)

  const [limite, setLimite] = useState(data.limite)

  const [totalPaginas, setTotalPaginas] = useState(data.totalPaginas)

  /**
   * ==========================================================
   * FILTROS
   * ==========================================================
   */

  const [numeroGuia, setNumeroGuia] = useState("")

  const [numeroContenedor, setNumeroContenedor] = useState("")

  const [documentoCliente, setDocumentoCliente] = useState("")

  const [sinCliente, setSinCliente] = useState(false)

  const [estado, setEstado] = useState<EstadoGuia | undefined>(undefined)

  const [estadoPago, setEstadoPago] = useState<EstadoPago | undefined>(
    undefined
  )

  const [tratamientoIGV, setTratamientoIGV] = useState<
    TratamientoIGV | undefined
  >(undefined)

  const [fechaDesde, setFechaDesde] = useState("")

  const [fechaHasta, setFechaHasta] = useState("")

  /**
   * ==========================================================
   * TRANSICIÓN
   * ==========================================================
   */

  const [isPending, startTransition] = useTransition()

  /**
   * ==========================================================
   * ESTADO DE EXPORTACIÓN
   * ==========================================================
   */

  const [exportando, setExportando] = useState(false)

  /**
   * ==========================================================
   * DIALOGS
   * ==========================================================
   */

  const [guiaDetalle, setGuiaDetalle] = useState<GuiaConRelaciones | null>(null)

  const [guiaSalida, setGuiaSalida] = useState<GuiaConRelaciones | null>(null)

  const [guiaAnular, setGuiaAnular] = useState<GuiaConRelaciones | null>(null)

  const [anulando, setAnulando] = useState(false)

  const [guiaPago, setGuiaPago] = useState<GuiaConRelaciones | null>(null)

  /**
   * ==========================================================
   * SINCRONIZAR DATOS
   * ==========================================================
   */

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGuias(data.guias)

    setTotal(data.total)

    setPagina(data.pagina)

    setLimite(data.limite)

    setTotalPaginas(data.totalPaginas)
  }, [data])

  /**
   * ==========================================================
   * OBTENER FILTROS ACTUALES
   * ==========================================================
   */

  function obtenerFiltros() {
    return {
      numeroGuia: numeroGuia.trim() || undefined,

      numeroContenedor: numeroContenedor.trim() || undefined,

      documentoCliente: documentoCliente.trim() || undefined,

      sinCliente,

      estado,

      estadoPago,

      tratamientoIGV,

      fechaDesde: fechaDesde ? new Date(`${fechaDesde}T00:00:00`) : undefined,

      fechaHasta: fechaHasta ? new Date(`${fechaHasta}T23:59:59`) : undefined,
    }
  }

  /**
   * ==========================================================
   * BUSCAR GUÍAS
   * ==========================================================
   */

  function buscarGuias(nuevaPagina = 1, nuevoLimite = limite) {
    startTransition(async () => {
      const resultado = await obtenerGuiasAction({
        pagina: nuevaPagina,

        limite: nuevoLimite,

        ...obtenerFiltros(),
      })

      if (!resultado.success) {
        toast.error(resultado.message)

        return
      }

      setGuias(resultado.data.guias)

      setTotal(resultado.data.total)

      setPagina(resultado.data.pagina)

      setLimite(resultado.data.limite)

      setTotalPaginas(resultado.data.totalPaginas)
    })
  }

  /**
   * ==========================================================
   * APLICAR FILTROS
   * ==========================================================
   */

  function aplicarFiltros() {
    buscarGuias(1, limite)
  }

  /**
   * ==========================================================
   * LIMPIAR FILTROS
   * ==========================================================
   */

  function limpiarFiltros() {
    setNumeroGuia("")

    setNumeroContenedor("")

    setDocumentoCliente("")

    setSinCliente(false)

    setEstado(undefined)

    setFechaDesde("")

    setFechaHasta("")

    setEstadoPago(undefined)

    setTratamientoIGV(undefined)

    startTransition(async () => {
      const resultado = await obtenerGuiasAction({
        pagina: 1,

        limite,
      })

      if (!resultado.success) {
        toast.error(resultado.message)

        return
      }

      setGuias(resultado.data.guias)

      setTotal(resultado.data.total)

      setPagina(resultado.data.pagina)

      setLimite(resultado.data.limite)

      setTotalPaginas(resultado.data.totalPaginas)
    })
  }

  /**
   * ==========================================================
   * CAMBIAR PÁGINA
   * ==========================================================
   */

  function cambiarPagina(nuevaPagina: number) {
    if (
      nuevaPagina < 1 ||
      nuevaPagina > totalPaginas ||
      nuevaPagina === pagina
    ) {
      return
    }

    buscarGuias(nuevaPagina, limite)
  }

  /**
   * ==========================================================
   * CAMBIAR LÍMITE
   * ==========================================================
   */

  function cambiarLimite(nuevoLimite: string | null) {
    if (nuevoLimite === null) return

    const limiteNumero = Number(nuevoLimite)

    buscarGuias(1, limiteNumero)
  }

  /**
   * ==========================================================
   * EXPORTAR EXCEL
   * ==========================================================
   *
   * Exporta todas las guías que coincidan con los filtros
   * actuales, no solamente las que aparecen en la página.
   */

  async function manejarExportarExcel() {
    try {
      setExportando(true)

      const filtros = obtenerFiltros()

      const resultado = await obtenerGuiasAction({
        pagina: 1,

        limite: 10000,

        ...filtros,
      })

      if (!resultado.success) {
        toast.error(resultado.message ?? "No se pudieron obtener las guías")

        return
      }

      if (resultado.data.guias.length === 0) {
        toast.info("No hay guías para exportar.")

        return
      }

      const datosExcel = resultado.data.guias.map((guia) => ({
        "N° Guía": guia.numeroGuia,

        Cliente: guia.cliente?.nombreCompleto ?? "Sin cliente",

        "Tipo documento": guia.cliente?.tipoDocumento ?? "",

        "Documento cliente": guia.cliente?.numeroDocumento ?? "",

        Contenedor: guia.contenedor.numeroContenedor,

        "Marca contenedor": guia.contenedor.marca,

        Medida: guia.contenedor.medida,

        "Tipo contenedor": guia.contenedor.tipo,

        "Empresa transporte ingreso":
          guia.empresaTransporteIngreso?.nombre ?? "",

        "Vehículo ingreso": guia.vehiculoIngreso?.placa ?? "",

        "Conductor ingreso": guia.conductorIngreso?.nombreCompleto ?? "",

        "Licencia ingreso": guia.conductorIngreso?.numeroLicencia ?? "",

        "Fecha ingreso": formatFechaNegocio(guia.fechaIngreso),

        "Empresa transporte salida": guia.empresaTransporteSalida?.nombre ?? "",

        "Vehículo salida": guia.vehiculoSalida?.placa ?? "",

        "Conductor salida": guia.conductorSalida?.nombreCompleto ?? "",

        "Licencia salida": guia.conductorSalida?.numeroLicencia ?? "",

        "Fecha salida": formatFechaNegocio(guia.fechaSalida),

        "Días almacenamiento": guia.diasAlmacenamiento ?? "",

        "Tipo precio": guia.tipoPrecio,

        "Precio primer día": guia.precioPrimerDia ?? "",

        "Precio día adicional": guia.precioDiaAdicional ?? "",

        "Precio ingreso / salida": guia.precioIngresoSalida ?? "",

        "Cantidad movimientos": guia.cantidadMovimientos ?? "",

        "Precio por movimiento": guia.precioMovimiento ?? "",

        "Subtotal movimientos": guia.subtotalMovimientos ?? "",

        Subtotal: guia.subtotal ?? "",

        "IGV %": guia.porcentajeIGV ?? "",

        "Monto IGV": guia.montoIGV ?? "",

        "Monto total": guia.montoTotal ?? "",

        "Tratamiento IGV": guia.tratamientoIGV,

        Estado: guia.estado,

        "Estado de pago": guia.estadoPago,

        Observaciones: guia.observaciones ?? "",

        "Fecha creación": formatFechaNegocio(guia.createdAt),
      }))

      exportarExcel({
        datos: datosExcel,

        nombreArchivo: `guias-${new Date().toISOString().slice(0, 10)}`,

        nombreHoja: "Guías",
      })

      toast.success(
        `${datosExcel.length} ${
          datosExcel.length === 1 ? "guía exportada" : "guías exportadas"
        } correctamente.`
      )
    } catch (error) {
      console.error("Error al exportar guías:", error)

      toast.error("Ocurrió un error al exportar las guías.")
    } finally {
      setExportando(false)
    }
  }

  /**
   * ==========================================================
   * ANULAR GUÍA
   * ==========================================================
   */

  async function confirmarAnulacion() {
    if (!guiaAnular) return

    setAnulando(true)

    const res = await anularGuiaAction(guiaAnular.id)

    setAnulando(false)

    setGuiaAnular(null)

    if (!res.success) {
      toast.error(res.message)

      return
    }

    toast.success(res.message)

    buscarGuias(pagina, limite)

    onCambio?.()
  }

  /**
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <div className="space-y-4">
      {/* ======================================================
          FILTROS
      ====================================================== */}

      <div className="rounded-lg border p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* NÚMERO GUÍA */}

          <div className="space-y-2">
            <label className="text-sm font-medium">N° de guía</label>

            <div className="relative">
              <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={numeroGuia}
                onChange={(e) => setNumeroGuia(e.target.value)}
                placeholder="Buscar guía..."
                className="pl-8"
              />
            </div>
          </div>

          {/* CONTENEDOR */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Contenedor</label>

            <Input
              value={numeroContenedor}
              onChange={(e) => setNumeroContenedor(e.target.value)}
              placeholder="Número de contenedor"
            />
          </div>

          {/* DOCUMENTO */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Documento del cliente</label>

            <Input
              value={documentoCliente}
              onChange={(e) => setDocumentoCliente(e.target.value)}
              placeholder="DNI o RUC"
            />
          </div>

          {/* CLIENTE */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Cliente</label>

            <Select
              value={sinCliente ? "SIN_CLIENTE" : "TODOS"}
              onValueChange={(value) => {
                setSinCliente(value === "SIN_CLIENTE")
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos los clientes" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="TODOS">Todos los clientes</SelectItem>

                <SelectItem value="SIN_CLIENTE">Sin cliente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ESTADO */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Estado</label>

            <Select
              value={estado ?? "TODOS"}
              onValueChange={(value) => {
                setEstado(value === "TODOS" ? undefined : (value as EstadoGuia))
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="TODOS">Todos los estados</SelectItem>

                <SelectItem value="ALMACENADO">Almacenado</SelectItem>

                <SelectItem value="RETIRADO">Retirado</SelectItem>

                <SelectItem value="ANULADO">Anulado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ESTADO DE PAGO */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Estado de pago</label>

            <Select
              value={estadoPago ?? "TODOS"}
              onValueChange={(value) => {
                setEstadoPago(
                  value === "TODOS" ? undefined : (value as EstadoPago)
                )
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos los estados de pago" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="TODOS">Todos los estados</SelectItem>

                <SelectItem value="PENDIENTE">Pendiente</SelectItem>

                <SelectItem value="PAGADO">Pagado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* TRATAMIENTO IGV */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Tratamiento IGV</label>

            <Select
              value={tratamientoIGV ?? "TODOS"}
              onValueChange={(value) => {
                setTratamientoIGV(
                  value === "TODOS" ? undefined : (value as TratamientoIGV)
                )
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>

                <SelectItem value="CON_IGV">Con IGV</SelectItem>

                <SelectItem value="SIN_IGV">Sin IGV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* FECHA DESDE */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Fecha desde</label>

            <Input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
          </div>

          {/* FECHA HASTA */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Fecha hasta</label>

            <Input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </div>
        </div>

        {/* BOTONES */}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={aplicarFiltros} disabled={isPending || exportando}>
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Buscar
          </Button>

          <Button
            variant="outline"
            onClick={limpiarFiltros}
            disabled={isPending || exportando}
          >
            <X className="mr-2 size-4" />
            Limpiar filtros
          </Button>

          <Button
            variant="outline"
            onClick={manejarExportarExcel}
            disabled={isPending || exportando || total === 0}
          >
            {exportando ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Download className="mr-2 size-4" />
            )}

            {exportando ? "Exportando..." : "Exportar Excel"}
          </Button>
        </div>
      </div>

      {/* ======================================================
          INFORMACIÓN
      ====================================================== */}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total === 0
            ? "No hay guías"
            : `${total} ${total === 1 ? "guía" : "guías"} encontradas`}
        </p>

        {isPending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Actualizando...
          </div>
        )}
      </div>

      {/* ======================================================
          TABLA
      ====================================================== */}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Guía</TableHead>

              <TableHead>Cliente</TableHead>

              <TableHead>Contenedor</TableHead>

              <TableHead>Ingreso</TableHead>

              <TableHead>Salida</TableHead>

              <TableHead>Estado</TableHead>

              <TableHead>Estado de pago</TableHead>

              <TableHead className="text-right">Monto total</TableHead>

              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {guias.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  No se encontraron guías.
                </TableCell>
              </TableRow>
            )}

            {guias.map((guia) => (
              <TableRow key={guia.id}>
                {/* GUÍA */}

                <TableCell className="font-medium">{guia.numeroGuia}</TableCell>

                {/* CLIENTE */}

                <TableCell>
                  {guia.cliente ? (
                    <div>
                      <p className="text-sm">
                        {guia.cliente.nombreCompleto || "Sin nombre"}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {guia.cliente.tipoDocumento}{" "}
                        {guia.cliente.numeroDocumento}
                      </p>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Sin cliente
                    </span>
                  )}
                </TableCell>

                {/* CONTENEDOR */}

                <TableCell>{guia.contenedor.numeroContenedor}</TableCell>

                {/* INGRESO */}

                <TableCell className="text-sm">
                  {formatFechaNegocio(guia.fechaIngreso)}
                </TableCell>

                {/* SALIDA */}

                <TableCell className="text-sm">
                  {formatFechaNegocio(guia.fechaSalida)}
                </TableCell>

                {/* ESTADO */}

                <TableCell>
                  <EstadoBadge estado={guia.estado} />
                </TableCell>

                {/* ESTADO DE PAGO */}

                <TableCell>
                  <EstadoPagoBadge estado={guia.estadoPago} />
                </TableCell>

                {/* MONTO */}

                <TableCell className="text-right text-sm">
                  {guia.montoTotal !== null
                    ? `S/ ${guia.montoTotal.toFixed(2)}`
                    : "—"}
                </TableCell>

                {/* ACCIONES */}

                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                        />
                      }
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setGuiaDetalle(guia)}>
                        <Eye className="mr-2 size-4" />
                        Ver detalles
                      </DropdownMenuItem>

                      {/* REGISTRAR SALIDA */}
                      {guia.estado === "ALMACENADO" && (
                        <DropdownMenuItem onClick={() => setGuiaSalida(guia)}>
                          <LogOut className="mr-2 size-4" />
                          Registrar salida
                        </DropdownMenuItem>
                      )}

                      {/* REGISTRAR PAGO */}
                      {guia.estado === "RETIRADO" &&
                        guia.estadoPago === "PENDIENTE" && (
                          <DropdownMenuItem onClick={() => setGuiaPago(guia)}>
                            <CreditCard className="mr-2 size-4" />
                            Registrar pago
                          </DropdownMenuItem>
                        )}

                      {/* ANULAR GUÍA */}
                      {guia.estado === "ALMACENADO" && (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setGuiaAnular(guia)}
                        >
                          <Ban className="mr-2 size-4" />
                          Anular guía
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ======================================================
          PAGINACIÓN
      ====================================================== */}

      {totalPaginas > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* REGISTROS POR PÁGINA */}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Mostrar</span>

            <Select
              value={String(limite)}
              onValueChange={cambiarLimite}
              disabled={isPending || exportando}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="10">10</SelectItem>

                <SelectItem value="20">20</SelectItem>

                <SelectItem value="50">50</SelectItem>

                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>

            <span>por página</span>
          </div>

          {/* NAVEGACIÓN */}

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagina === 1 || isPending || exportando}
              onClick={() => cambiarPagina(pagina - 1)}
            >
              <ChevronLeft className="mr-1 size-4" />
              Anterior
            </Button>

            <span className="min-w-25 text-center text-sm">
              Página {pagina} de {totalPaginas}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={pagina === totalPaginas || isPending || exportando}
              onClick={() => cambiarPagina(pagina + 1)}
            >
              Siguiente
              <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ======================================================
          DETALLE
      ====================================================== */}

      <GuiaDetalleSheet
        guia={guiaDetalle}
        open={!!guiaDetalle}
        onOpenChange={(open) => !open && setGuiaDetalle(null)}
      />

      {/* ======================================================
          SALIDA
      ====================================================== */}

      {guiaSalida && (
        <RegistrarSalidaDialog
          guia={guiaSalida}
          open={!!guiaSalida}
          onOpenChange={(open) => !open && setGuiaSalida(null)}
          onRegistrada={() => {
            setGuiaSalida(null)

            buscarGuias(pagina, limite)

            onCambio?.()
          }}
        />
      )}

      {/* ======================================================
          PAGO
        ====================================================== */}

      {guiaPago && (
        <RegistrarPagoDialog
          guia={guiaPago}
          open={!!guiaPago}
          onOpenChange={(open) => !open && setGuiaPago(null)}
          onRegistrado={() => {
            setGuiaPago(null)

            buscarGuias(pagina, limite)

            onCambio?.()
          }}
        />
      )}

      {/* ======================================================
          ANULAR
      ====================================================== */}

      <AlertDialog
        open={!!guiaAnular}
        onOpenChange={(open) => !open && setGuiaAnular(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Anular la guía {guiaAnular?.numeroGuia}?
            </AlertDialogTitle>

            <AlertDialogDescription>
              Esta acción no elimina el registro, pero marca la guía como
              anulada y no podrá revertirse desde aquí.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>

            <AlertDialogAction
              disabled={anulando}
              onClick={confirmarAnulacion}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              {anulando ? "Anulando..." : "Sí, anular"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
