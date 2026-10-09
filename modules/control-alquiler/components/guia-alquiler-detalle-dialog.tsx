"use client"

import {
  BadgeDollarSignIcon,
  CalendarDaysIcon,
  Clock3Icon,
  UserRoundIcon,
  WrenchIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { EstadoPagoBadge } from "@/modules/guias/components/estado-pago-badge"

type Guia = {
  id: string
  numeroGuia: string
  fechaInicio: string
  fechaFin: string
  solicitante: string | null
  horaSalida: string
  horaInicio: string
  horaFinalizacion: string
  horaRetorno: string
  subtotal: number | null
  igv: number | null
  total: number | null
  modoIGVCotizacion: "SIN_IGV" | "CON_IGV" | "IGV_INCLUIDO" | null
  numeroCotizacion: string | null
  estadoPago: "PENDIENTE" | "PAGADO"
  metodoPago:
    "EFECTIVO" | "YAPE" | "PLIN" | "TRANSFERENCIA" | "TARJETA" | "OTRO" | null
  numeroOperacion: string | null
  fechaPago: string | null
  horaPago: string | null
  estado: "EN_PROCESO" | "FINALIZADO" | "ANULADO"
  observaciones: string | null
  createdAt: string
  updatedAt: string
  cliente: {
    tipoDocumento: string
    numeroDocumento: string
    nombreCompleto: string | null
    telefono: string | null
    observaciones: string | null
  } | null
  equipo: {
    codigo: string
    nombre: string
    tipo: string
    marca: string | null
    modelo: string | null
    placa: string | null
    capacidadCarga: number | null
    estado: string
  }
  operador: {
    nombres: string
    apellidos: string
    tipoDocumento: string
    numeroDocumento: string
    telefono: string | null
    licencia: string | null
    activo: boolean
  }
}

interface GuiaAlquilerDetalleDialogProps {
  guia: Guia | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ESTADOS: Record<Guia["estado"], { texto: string; clases: string }> = {
  EN_PROCESO: {
    texto: "En proceso",
    clases:
      "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
  },
  FINALIZADO: {
    texto: "Finalizado",
    clases:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  },
  ANULADO: {
    texto: "Anulado",
    clases:
      "border-red-200 bg-red-50 text-red-700 hover:bg-red-50 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
  },
}

const METODOS_PAGO: Record<NonNullable<Guia["metodoPago"]>, string> = {
  EFECTIVO: "Efectivo",
  YAPE: "Yape",
  PLIN: "Plin",
  TRANSFERENCIA: "Transferencia bancaria",
  TARJETA: "Tarjeta",
  OTRO: "Otro",
}

function fechaLarga(fecha: string) {
  const [year, month, day] = fecha.split("-").map(Number)
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)))
}

function fechaHora(fecha: string) {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(fecha))
}

function Campo({
  etiqueta,
  children,
}: {
  etiqueta: string
  children: React.ReactNode
}) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {etiqueta}
      </p>
      <div className="text-sm break-words">{children || "—"}</div>
    </div>
  )
}

export function GuiaAlquilerDetalleDialog({
  guia,
  open,
  onOpenChange,
}: GuiaAlquilerDetalleDialogProps) {
  if (!guia) return null
  const estado = ESTADOS[guia.estado]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-3">
            <DialogTitle className="text-xl">
              Guía de alquiler {guia.numeroGuia}
            </DialogTitle>
            <Badge variant="outline" className={estado.clases}>
              {estado.texto}
            </Badge>
          </div>
          <DialogDescription>
            Información completa del servicio, cliente y cotización.
          </DialogDescription>
        </DialogHeader>

        <section className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <CalendarDaysIcon className="size-4 text-primary" />
            Servicio
          </h3>
          <div className="grid gap-4 rounded-lg border bg-muted/20 p-4 sm:grid-cols-2">
            <Campo etiqueta="Fecha de inicio">
              {fechaLarga(guia.fechaInicio)}
            </Campo>
            <Campo etiqueta="Fecha de fin">{fechaLarga(guia.fechaFin)}</Campo>
            <Campo etiqueta="Solicitante">{guia.solicitante}</Campo>
            <Campo etiqueta="Estado">
              <Badge variant="outline" className={estado.clases}>
                {estado.texto}
              </Badge>
            </Campo>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Clock3Icon className="size-4 text-primary" />
            Horarios
          </h3>
          <div className="grid gap-4 rounded-lg border bg-muted/20 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <Campo etiqueta="Salida">{guia.horaSalida}</Campo>
            <Campo etiqueta="Inicio">{guia.horaInicio}</Campo>
            <Campo etiqueta="Finalización">{guia.horaFinalizacion}</Campo>
            <Campo etiqueta="Retorno">{guia.horaRetorno}</Campo>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <WrenchIcon className="size-4 text-primary" />
              Equipo
            </h3>
            <div className="grid gap-4 rounded-lg border bg-muted/20 p-4">
              <Campo etiqueta="Equipo / máquina">
                {guia.equipo.nombre} ({guia.equipo.codigo})
              </Campo>
              <Campo etiqueta="Tipo de equipo">
                {guia.equipo.tipo.replaceAll("_", " ").toLowerCase()}
              </Campo>
              <Campo etiqueta="Marca / modelo">
                {[guia.equipo.marca, guia.equipo.modelo]
                  .filter(Boolean)
                  .join(" / ")}
              </Campo>
              <Campo etiqueta="Placa">{guia.equipo.placa}</Campo>
              <Campo etiqueta="Capacidad de carga">
                {guia.equipo.capacidadCarga === null
                  ? "—"
                  : `${guia.equipo.capacidadCarga.toFixed(2)} t`}
              </Campo>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <UserRoundIcon className="size-4 text-primary" />
              Operador
            </h3>
            <div className="grid gap-4 rounded-lg border bg-muted/20 p-4">
              <Campo etiqueta="Nombre">
                {guia.operador.nombres} {guia.operador.apellidos}
              </Campo>
              <Campo etiqueta="Documento">
                {guia.operador.tipoDocumento} {guia.operador.numeroDocumento}
              </Campo>
              <Campo etiqueta="Teléfono">{guia.operador.telefono}</Campo>
              <Campo etiqueta="Licencia">{guia.operador.licencia}</Campo>
              <Campo etiqueta="Estado del operador">
                {guia.operador.activo ? "Activo" : "Inactivo"}
              </Campo>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <UserRoundIcon className="size-4 text-primary" />
            Cliente
          </h3>
          <div className="grid gap-4 rounded-lg border bg-muted/20 p-4 sm:grid-cols-2">
            <Campo etiqueta="Nombre / razón social">
              {guia.cliente?.nombreCompleto ?? "Sin cliente asignado"}
            </Campo>
            <Campo etiqueta="Documento">
              {guia.cliente
                ? `${guia.cliente.tipoDocumento} ${guia.cliente.numeroDocumento}`
                : "—"}
            </Campo>
            <Campo etiqueta="Teléfono">{guia.cliente?.telefono}</Campo>
            <Campo etiqueta="Observaciones del cliente">
              {guia.cliente?.observaciones}
            </Campo>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <BadgeDollarSignIcon className="size-4 text-primary" />
            Cotización y pago
          </h3>
          <div className="grid gap-4 rounded-lg border bg-muted/20 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <Campo etiqueta="N.° de cotización">{guia.numeroCotizacion}</Campo>
            <Campo etiqueta="Tratamiento de IGV">
              {guia.modoIGVCotizacion
                ? {
                    SIN_IGV: "Sin IGV",
                    CON_IGV: "IGV agregado (18%)",
                    IGV_INCLUIDO: "IGV incluido",
                  }[guia.modoIGVCotizacion]
                : "Sin cotización"}
            </Campo>
            <Campo etiqueta="Estado de pago">
              {guia.total === null ? (
                "Sin cotización"
              ) : (
                <EstadoPagoBadge estado={guia.estadoPago} />
              )}
            </Campo>
            <Campo etiqueta="Método de pago">
              {guia.metodoPago ? METODOS_PAGO[guia.metodoPago] : "—"}
            </Campo>
            <Campo etiqueta="N.° de operación">{guia.numeroOperacion}</Campo>
            <Campo etiqueta="Fecha de pago">
              {guia.fechaPago ? fechaLarga(guia.fechaPago) : "—"}
            </Campo>
            <Campo etiqueta="Hora de pago">{guia.horaPago}</Campo>
            <Campo etiqueta="Subtotal">
              {guia.subtotal === null ? "—" : `S/ ${guia.subtotal.toFixed(2)}`}
            </Campo>
            <Campo etiqueta="IGV">
              {guia.igv === null ? "—" : `S/ ${guia.igv.toFixed(2)}`}
            </Campo>
            <Campo etiqueta="Total">
              {guia.total === null ? "—" : `S/ ${guia.total.toFixed(2)}`}
            </Campo>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-semibold">Observaciones de la guía</h3>
          <div className="rounded-lg border bg-muted/20 p-4 text-sm whitespace-pre-wrap">
            {guia.observaciones || "Sin observaciones."}
          </div>
        </section>

        <Separator />
        <div className="grid gap-3 text-xs text-muted-foreground sm:grid-cols-2">
          <p>Registrada: {fechaHora(guia.createdAt)}</p>
          <p>Última actualización: {fechaHora(guia.updatedAt)}</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
