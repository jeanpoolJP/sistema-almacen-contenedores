// modules/guias/components/guias-table.tsx

"use client"

import { useEffect, useState, useTransition } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import {
  Eye,
  LogOut,
  MoreHorizontal,
  Search,
  Ban,
  Loader2,
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
import { GuiaDetalleSheet } from "./guia-detalle-sheet"
import { RegistrarSalidaDialog } from "./registrar-salida-dialog"

import { anularGuiaAction, obtenerGuiasAction } from "../guia.actions"

import type { GuiaConRelaciones } from "./guia-con-relaciones.type"

import type { EstadoGuia } from "@/lib/generated/prisma"

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
  guias: GuiaConRelaciones[]

  total: number

  paginaInicial: number

  limiteInicial: number

  totalPaginasInicial: number

  onCambio?: () => void
}

/**
 * ============================================================
 * COMPONENTE
 * ============================================================
 */

export function GuiasTable({
  guias: guiasIniciales,
  total: totalInicial,
  paginaInicial,
  limiteInicial,
  totalPaginasInicial,
  onCambio,
}: GuiasTableProps) {
  // ==========================================================
  // DATOS
  // ==========================================================

  const [guias, setGuias] = useState<GuiaConRelaciones[]>(guiasIniciales)

  const [total, setTotal] = useState(totalInicial)

  const [pagina, setPagina] = useState(paginaInicial)

  const [limite, setLimite] = useState(limiteInicial)

  const [totalPaginas, setTotalPaginas] = useState(totalPaginasInicial)

  // ==========================================================
  // FILTROS
  // ==========================================================

  const [numeroGuia, setNumeroGuia] = useState("")

  const [numeroContenedor, setNumeroContenedor] = useState("")

  const [documentoCliente, setDocumentoCliente] = useState("")

  const [estado, setEstado] = useState<EstadoGuia | undefined>(undefined)

  const [fechaDesde, setFechaDesde] = useState("")

  const [fechaHasta, setFechaHasta] = useState("")

  // ==========================================================
  // TRANSITION
  // ==========================================================

  const [isPending, startTransition] = useTransition()

  // ==========================================================
  // DIALOGS
  // ==========================================================

  const [guiaDetalle, setGuiaDetalle] = useState<GuiaConRelaciones | null>(null)

  const [guiaSalida, setGuiaSalida] = useState<GuiaConRelaciones | null>(null)

  const [guiaAnular, setGuiaAnular] = useState<GuiaConRelaciones | null>(null)

  const [anulando, setAnulando] = useState(false)

  // ==========================================================
  // SINCRONIZAR PROPS INICIALES
  // ==========================================================

  useEffect(() => {
    setGuias(guiasIniciales)
    setTotal(totalInicial)
    setPagina(paginaInicial)
    setLimite(limiteInicial)
    setTotalPaginas(totalPaginasInicial)
  }, [
    guiasIniciales,
    totalInicial,
    paginaInicial,
    limiteInicial,
    totalPaginasInicial,
  ])

  // ==========================================================
  // BUSCAR GUÍAS
  // ==========================================================

  function buscarGuias(nuevaPagina = 1, nuevoLimite = limite) {
    startTransition(async () => {
      const resultado = await obtenerGuiasAction({
        pagina: nuevaPagina,

        limite: nuevoLimite,

        numeroGuia: numeroGuia.trim() || undefined,

        numeroContenedor: numeroContenedor.trim() || undefined,

        documentoCliente: documentoCliente.trim() || undefined,

        estado,

        fechaDesde: fechaDesde ? new Date(`${fechaDesde}T00:00:00`) : undefined,

        fechaHasta: fechaHasta ? new Date(`${fechaHasta}T23:59:59`) : undefined,
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

  // ==========================================================
  // APLICAR FILTROS
  // ==========================================================

  function aplicarFiltros() {
    buscarGuias(1, limite)
  }

  // ==========================================================
  // LIMPIAR FILTROS
  // ==========================================================

  function limpiarFiltros() {
    setNumeroGuia("")
    setNumeroContenedor("")
    setDocumentoCliente("")
    setEstado(undefined)
    setFechaDesde("")
    setFechaHasta("")

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

  // ==========================================================
  // CAMBIAR PÁGINA
  // ==========================================================

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

  // ==========================================================
  // CAMBIAR LÍMITE
  // ==========================================================

  function cambiarLimite(nuevoLimite: string | null) {
    if (nuevoLimite === null) return

    const limiteNumero = Number(nuevoLimite)

    setLimite(limiteNumero)

    buscarGuias(1, limiteNumero)
  }

  // ==========================================================
  // ANULAR GUÍA
  // ==========================================================

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

    // Volvemos a consultar la página actual
    buscarGuias(pagina, limite)

    onCambio?.()
  }

  return (
    <div className="space-y-4">
      {/* ======================================================
          FILTROS
      ====================================================== */}

      <div className="rounded-lg border p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* NÚMERO DE GUÍA */}

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

          {/* DOCUMENTO CLIENTE */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Documento del cliente</label>

            <Input
              value={documentoCliente}
              onChange={(e) => setDocumentoCliente(e.target.value)}
              placeholder="DNI o RUC"
            />
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
          <Button onClick={aplicarFiltros} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Buscar
          </Button>

          <Button
            variant="outline"
            onClick={limpiarFiltros}
            disabled={isPending}
          >
            <X className="mr-2 size-4" />
            Limpiar filtros
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

              <TableHead className="text-right">Monto total</TableHead>

              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {guias.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
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

                      {guia.estado === "ALMACENADO" && (
                        <DropdownMenuItem onClick={() => setGuiaSalida(guia)}>
                          <LogOut className="mr-2 size-4" />
                          Registrar salida
                        </DropdownMenuItem>
                      )}

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
              disabled={isPending}
            >
              <SelectTrigger className="w-[80px]">
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
              disabled={pagina === 1 || isPending}
              onClick={() => cambiarPagina(pagina - 1)}
            >
              Anterior
            </Button>

            <span className="min-w-[100px] text-center text-sm">
              Página {pagina} de {totalPaginas}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={pagina === totalPaginas || isPending}
              onClick={() => cambiarPagina(pagina + 1)}
            >
              Siguiente
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
