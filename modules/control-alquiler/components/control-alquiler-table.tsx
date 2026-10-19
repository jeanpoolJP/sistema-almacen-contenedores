// modules/control-alquiler/components/control-alquiler-table.tsx
"use client"

import { useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import {
  CreditCard,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  UserCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { GuiaAlquilerFormSheet } from "./guia-alquiler-form-sheet"
import { AsignarClienteSheet } from "./asignar-cliente-sheet"
import { AsignarPagoSheet } from "./asignar-pago-sheet"
import { ControlAlquilerFiltros } from "./control-alquiler-filtros"

import type {
  GuiaAlquilerListItem,
  GuiaAlquilerPaginado,
  FiltrosGuiaAlquiler,
} from "../control-alquiler.types"
import type { Equipo } from "@/modules/equipos/equipos.types"
import type { Operador } from "@/modules/operadores/operadores.types"
import type { Cliente } from "@/modules/clientes/cliente.types"

import { formatFecha } from "../utils/control-alquiler.utils"

interface Props {
  resultado: GuiaAlquilerPaginado
  filtros: FiltrosGuiaAlquiler
  equipos: Equipo[]
  operadores: Operador[]
  clientes: Cliente[]
}

export function ControlAlquilerTable({
  resultado,
  filtros,
  equipos,
  operadores,
  clientes,
}: Props) {
  const [openForm, setOpenForm] = useState(false)
  const [guiaEditar, setGuiaEditar] = useState<GuiaAlquilerListItem | null>(
    null
  )

  const [guiaCliente, setGuiaCliente] = useState<GuiaAlquilerListItem | null>(
    null
  )
  const [guiaPago, setGuiaPago] = useState<GuiaAlquilerListItem | null>(null)
  const [guiaDetalle, setGuiaDetalle] = useState<GuiaAlquilerListItem | null>(
    null
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Control de Alquiler de Máquinas
          </h1>
          <p className="text-muted-foreground">
            Registra, edita y administra las guías de alquiler de equipos.
          </p>
        </div>
        <Button
          onClick={() => {
            setGuiaEditar(null)
            setOpenForm(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Guía de Alquiler
        </Button>
      </div>

      <ControlAlquilerFiltros
        key={JSON.stringify([
          filtros.busqueda,
          filtros.estado,
          filtros.estadoPago,
          filtros.cotizacion,
          filtros.desde,
          filtros.hasta,
        ])}
        filtros={filtros}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[90px]">N° Guía</TableHead>
              <TableHead className="w-[140px]">Cliente</TableHead>
              <TableHead className="w-[160px]">
                Máquina / Operador
              </TableHead>
              <TableHead className="w-[110px]">Fechas</TableHead>
              <TableHead className="w-[100px]">Estado</TableHead>
              <TableHead className="w-[100px]">Pago</TableHead>
              <TableHead className="w-[100px]">Cotización</TableHead>
              <TableHead className="w-[72px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resultado.guias.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground"
                >
                  No se encontraron guías de alquiler.
                </TableCell>
              </TableRow>
            ) : (
              resultado.guias.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="font-medium">{g.numeroGuia}</TableCell>
                  <TableCell
                    className="max-w-[140px] truncate"
                    title={
                      g.cliente
                        ? (g.cliente.nombreCompleto ??
                          g.cliente.numeroDocumento)
                        : undefined
                    }
                  >
                    {g.cliente
                      ? (g.cliente.nombreCompleto ?? g.cliente.numeroDocumento)
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{g.equipo.nombre}</div>
                      <div className="text-muted-foreground">
                        {g.operador
                          ? `${g.operador.nombres}`
                          : (g.nombreOperadorExterno ?? "Sin operador")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatFecha(g.fechaInicio)}</div>
                      <div className="text-muted-foreground">
                        {formatFecha(g.fechaFin)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <EstadoBadge estado={g.estado} />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        g.estadoPago === "PAGADO" ? "default" : "secondary"
                      }
                    >
                      {g.estadoPago}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        !g.numeroCotizacion
                          ? "text-muted-foreground"
                          : undefined
                      }
                    >
                      {g.numeroCotizacion || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label="Acciones"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => setGuiaDetalle(g)}>
                          <Eye className="mr-2 size-4" />
                          Ver detalle
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setGuiaEditar(g)
                            setOpenForm(true)
                          }}
                        >
                          <Pencil className="mr-2 size-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setGuiaCliente(g)}>
                          <UserCircle className="mr-2 size-4" />
                          Asignar cliente
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setGuiaPago(g)}>
                          <CreditCard className="mr-2 size-4" />
                          Pago
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Paginacion resultado={resultado} filtros={filtros} />

      {/* Sheets */}
      <GuiaAlquilerFormSheet
        open={openForm}
        onOpenChange={setOpenForm}
        guia={guiaEditar}
        equipos={equipos}
        operadores={operadores}
        clientes={clientes}
      />

      {guiaCliente && (
        <AsignarClienteSheet
          open={!!guiaCliente}
          onOpenChange={(v) => !v && setGuiaCliente(null)}
          guia={guiaCliente}
          clientes={clientes}
        />
      )}

      {guiaPago && (
        <AsignarPagoSheet
          open={!!guiaPago}
          onOpenChange={(v) => !v && setGuiaPago(null)}
          guia={guiaPago}
        />
      )}

      <Dialog
        open={!!guiaDetalle}
        onOpenChange={(v) => !v && setGuiaDetalle(null)}
      >
        <DialogContent className="max-h-[90vh] w-[90vw] max-w-4xl overflow-y-auto p-0 sm:max-w-4xl">
          <DialogHeader className="border-b px-6 py-5">
            <DialogTitle className="text-xl">
              Guía {guiaDetalle?.numeroGuia}
            </DialogTitle>
            <DialogDescription>
              Detalle completo de la guía de alquiler.
            </DialogDescription>
          </DialogHeader>

          {guiaDetalle && (
            <div className="space-y-6 px-6 py-5">
              <div className="grid gap-4 md:grid-cols-2">
                <InfoBlock title="Datos generales">
                  <InfoRow
                    label="Cliente"
                    value={
                      guiaDetalle.cliente
                        ? (guiaDetalle.cliente.nombreCompleto ??
                          guiaDetalle.cliente.numeroDocumento)
                        : "—"
                    }
                  />
                  <InfoRow label="Equipo" value={guiaDetalle.equipo.nombre} />
                  <InfoRow
                    label="Operador"
                    value={
                      guiaDetalle.operador
                        ? `${guiaDetalle.operador.nombres} ${guiaDetalle.operador.apellidos}`
                        : (guiaDetalle.nombreOperadorExterno ?? "—")
                    }
                  />
                  <InfoRow
                    label="Solicitante"
                    value={guiaDetalle.solicitante ?? "—"}
                  />
                  <InfoRow
                    label="Lugar"
                    value={guiaDetalle.lugarServicio ?? "—"}
                  />
                </InfoBlock>

                <InfoBlock title="Fechas y tiempos">
                  <InfoRow
                    label="Fecha inicio"
                    value={formatFecha(guiaDetalle.fechaInicio)}
                  />
                  <InfoRow
                    label="Fecha fin"
                    value={formatFecha(guiaDetalle.fechaFin)}
                  />
                  <InfoRow
                    label="Hora salida"
                    value={guiaDetalle.horaSalida ?? "—"}
                  />
                  <InfoRow
                    label="Hora inicio"
                    value={guiaDetalle.horaInicio ?? "—"}
                  />
                  <InfoRow
                    label="Hora finalización"
                    value={guiaDetalle.horaFinalizacion ?? "—"}
                  />
                  <InfoRow
                    label="Hora retorno"
                    value={guiaDetalle.horaRetorno ?? "—"}
                  />
                  <InfoRow
                    label="Horas servicio"
                    value={
                      guiaDetalle.horasServicio != null
                        ? String(guiaDetalle.horasServicio)
                        : "—"
                    }
                  />
                </InfoBlock>

                <InfoBlock title="Cobranza">
                  <InfoRow
                    label="Subtotal"
                    value={
                      guiaDetalle.subtotal != null
                        ? `S/ ${guiaDetalle.subtotal.toFixed(2)}`
                        : "—"
                    }
                  />
                  <InfoRow
                    label="IGV"
                    value={
                      guiaDetalle.igv != null
                        ? `S/ ${guiaDetalle.igv.toFixed(2)}`
                        : "—"
                    }
                  />
                  <InfoRow
                    label="Total"
                    value={
                      guiaDetalle.total != null
                        ? `S/ ${guiaDetalle.total.toFixed(2)}`
                        : "—"
                    }
                  />
                  <InfoRow
                    label="Modo IGV"
                    value={guiaDetalle.modoIGVCotizacion ?? "—"}
                  />
                  <InfoRow
                    label="Cotización"
                    value={guiaDetalle.numeroCotizacion ?? "—"}
                  />
                </InfoBlock>

                <InfoBlock title="Pago">
                  <InfoRow label="Estado" value={guiaDetalle.estadoPago} />
                  <InfoRow
                    label="Método"
                    value={guiaDetalle.metodoPago ?? "—"}
                  />
                  <InfoRow
                    label="Número operación"
                    value={guiaDetalle.numeroOperacion ?? "—"}
                  />
                  <InfoRow
                    label="Fecha pago"
                    value={guiaDetalle.fechaPago ?? "—"}
                  />
                  <InfoRow
                    label="Hora pago"
                    value={guiaDetalle.horaPago ?? "—"}
                  />
                </InfoBlock>
              </div>

              <InfoBlock title="Descripción y observaciones">
                <InfoRow
                  label="Descripción"
                  value={guiaDetalle.descripcionServicio ?? "—"}
                />
                <InfoRow
                  label="Observaciones"
                  value={guiaDetalle.observaciones ?? "—"}
                />
              </InfoBlock>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================================
// SUBCOMPONENTES
// ============================================================

function EstadoBadge({ estado }: { estado: GuiaAlquilerListItem["estado"] }) {
  const map: Record<string, { label: string; variant: any }> = {
    EN_PROCESO: { label: "En proceso", variant: "secondary" },
    FINALIZADO: { label: "Finalizado", variant: "default" },
    ANULADO: { label: "Anulado", variant: "destructive" },
  }
  const c = map[estado] ?? { label: estado, variant: "outline" }
  return <Badge variant={c.variant}>{c.label}</Badge>
}

function InfoBlock({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <p className="mb-3 text-sm font-semibold text-foreground">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">
        {value ?? "—"}
      </span>
    </div>
  )
}

function Paginacion({
  resultado,
  filtros,
}: {
  resultado: GuiaAlquilerPaginado
  filtros: FiltrosGuiaAlquiler
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const irA = (pagina: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("pagina", String(pagina))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Página {resultado.pagina} de {resultado.totalPaginas} —{" "}
        {resultado.total} registros
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={resultado.pagina <= 1}
          onClick={() => irA(resultado.pagina - 1)}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={resultado.pagina >= resultado.totalPaginas}
          onClick={() => irA(resultado.pagina + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}
