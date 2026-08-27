// modules/guias/components/guia-detalle-sheet.tsx

"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"

import { formatearHora } from "../utils/formatear-hora"
import { formatearFecha } from "../utils/formatear-fecha"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

import { EstadoBadge } from "./estado-badge"
import type { GuiaConRelaciones } from "./guia-con-relaciones.type"

type GuiaDetalleSheetProps = {
  guia: GuiaConRelaciones | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function Dato({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value ?? "—"}</p>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-semibold text-foreground">{children}</p>
}

function formatMoneda(valor: number | null) {
  if (valor === null || valor === undefined) return null
  return `S/ ${valor.toFixed(2)}`
}

export function GuiaDetalleSheet({
  guia,
  open,
  onOpenChange,
}: GuiaDetalleSheetProps) {
  if (!guia) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-hidden p-0 sm:max-w-lg">
        <SheetHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <SheetTitle>Guía {guia.numeroGuia}</SheetTitle>
            <EstadoBadge estado={guia.estado} />
          </div>
          <SheetDescription>
            Registrada el{" "}
            {format(new Date(guia.createdAt), "dd MMM yyyy, HH:mm", {
              locale: es,
            })}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-5rem)] px-6">
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <SectionTitle>Cliente</SectionTitle>
              <div className="grid grid-cols-2 gap-3">
                <Dato
                  label="Documento"
                  value={
                    guia.cliente
                      ? `${guia.cliente.tipoDocumento} ${guia.cliente.numeroDocumento}`
                      : null
                  }
                />
                <Dato label="Nombre" value={guia.cliente?.nombreCompleto} />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <SectionTitle>Contenedor</SectionTitle>
              <div className="grid grid-cols-2 gap-3">
                <Dato label="Número" value={guia.contenedor.numeroContenedor} />
                <Dato label="Marca" value={guia.contenedor.marca} />
                <Dato label="Medida" value={`${guia.contenedor.medida} pies`} />
                <Dato
                  label="Tipo"
                  value={
                    guia.contenedor.tipo === "REEFER" ? "Reefer" : "Normal"
                  }
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <SectionTitle>Ingreso</SectionTitle>
              <div className="grid grid-cols-2 gap-3">
                <Dato label="Fecha" value={formatearFecha(guia.fechaIngreso)} />
                <Dato label="Hora" value={formatearHora(guia.horaIngreso)} />
                <Dato
                  label="Empresa de transporte"
                  value={guia.empresaTransporteIngreso.nombre}
                />
                <Dato label="Placa" value={guia.vehiculoIngreso.placa} />
                <Dato
                  label="Conductor"
                  value={guia.conductorIngreso.nombreCompleto}
                />
                <Dato
                  label="Licencia"
                  value={guia.conductorIngreso.numeroLicencia}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <SectionTitle>Salida</SectionTitle>
              {guia.fechaSalida ? (
                <div className="grid grid-cols-2 gap-3">
                  <Dato
                    label="Fecha"
                    value={formatearFecha(guia.fechaSalida)}
                  />
                  <Dato label="Hora" value={formatearHora(guia.horaSalida)} />
                  <Dato
                    label="Empresa de transporte"
                    value={guia.empresaTransporteSalida?.nombre}
                  />
                  <Dato label="Placa" value={guia.vehiculoSalida?.placa} />
                  <Dato
                    label="Conductor"
                    value={guia.conductorSalida?.nombreCompleto}
                  />
                  <Dato
                    label="Licencia"
                    value={guia.conductorSalida?.numeroLicencia}
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  El contenedor aún no ha salido del almacén.
                </p>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <SectionTitle>Almacenamiento y precio</SectionTitle>
              <div className="grid grid-cols-2 gap-3">
                <Dato
                  label="Días de almacenamiento"
                  value={guia.diasAlmacenamiento}
                />
                <Dato
                  label="Tipo de precio"
                  value={
                    guia.tipoPrecio === "ESTANDAR"
                      ? "Estándar"
                      : "Personalizado"
                  }
                />
                <Dato
                  label="Precio primer día"
                  value={formatMoneda(guia.precioPrimerDia)}
                />
                <Dato
                  label="Precio día adicional"
                  value={formatMoneda(guia.precioDiaAdicional)}
                />
                <Dato label="Subtotal" value={formatMoneda(guia.subtotal)} />
                <Dato
                  label={
                    guia.tratamientoIGV === "CON_IGV"
                      ? `IGV (${guia.porcentajeIGV ?? 18}%)`
                      : "IGV"
                  }
                  value={
                    guia.tratamientoIGV === "CON_IGV"
                      ? formatMoneda(guia.montoIGV)
                      : "No incluye"
                  }
                />
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">Monto total</p>
                <p className="text-lg font-semibold">
                  {formatMoneda(guia.montoTotal) ?? "Pendiente de calcular"}
                </p>
              </div>
            </div>

            {guia.observaciones && (
              <>
                <Separator />
                <div className="space-y-2">
                  <SectionTitle>Observaciones</SectionTitle>
                  <p className="text-sm text-muted-foreground">
                    {guia.observaciones}
                  </p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
