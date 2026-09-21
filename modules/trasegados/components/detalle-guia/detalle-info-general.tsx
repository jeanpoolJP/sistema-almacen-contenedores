// modules\trasegados\components\detalle-guia\detalle-info-general.tsx

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatDateTime } from "@/lib/date/format"
import { cn } from "@/lib/utils"

import type { GuiaTrasegadoDetalle } from "../../types/guia-trasegado-detalle.types"

interface DetalleInfoGeneralProps {
  guia: GuiaTrasegadoDetalle
}

export function DetalleInfoGeneral({ guia }: DetalleInfoGeneralProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Información general</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Número de guía" value={guia.numeroGuia} />
          <Row
            label="Descripción del servicio"
            value={guia.descripcionServicio ?? "—"}
          />
          <Row
            label="Fecha de ingreso"
            value={formatDateTime(guia.fechaIngreso)}
          />
          <Row
            label="Tratamiento IGV"
            value={guia.tratamientoIGV === "CON_IGV" ? "Con IGV" : "Sin IGV"}
          />
          {guia.observaciones && (
            <Row label="Observaciones" value={guia.observaciones} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Totales y pago</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row
            label="Tratamiento IGV"
            value={guia.tratamientoIGV === "CON_IGV" ? "Con IGV" : "Sin IGV"}
          />
          {guia.subtotal != null && (
            <Row label="Subtotal" value={`S/ ${guia.subtotal.toFixed(2)}`} />
          )}
          {guia.porcentajeIGV != null && guia.tratamientoIGV === "CON_IGV" && (
            <Row
              label={`IGV (${guia.porcentajeIGV}%)`}
              value={`S/ ${(guia.montoIGV ?? 0).toFixed(2)}`}
            />
          )}
          {guia.totalPagar != null && (
            <Row
              label="Total a pagar"
              value={`S/ ${guia.totalPagar.toFixed(2)}`}
              bold
            />
          )}
          <Separator />
          <Row
            label="Estado de pago"
            value={guia.estadoPago === "PAGADO" ? "Pagado" : "Pendiente"}
          />
          {guia.metodoPago && <Row label="Método" value={guia.metodoPago} />}
          {guia.numeroOperacion && (
            <Row label="N° de operación" value={guia.numeroOperacion} />
          )}
          {guia.fechaPago && (
            <Row label="Fecha de pago" value={formatDateTime(guia.fechaPago)} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {guia.cliente ? (
            <>
              <Row
                label="Tipo de documento"
                value={guia.cliente.tipoDocumento}
              />
              <Row
                label="Número de documento"
                value={guia.cliente.numeroDocumento}
              />
              <Row
                label="Nombre completo"
                value={guia.cliente.nombreCompleto ?? "—"}
              />
              <Row label="Teléfono" value={guia.cliente.telefono ?? "—"} />
              {guia.cliente.observaciones && (
                <Row label="Observaciones" value={guia.cliente.observaciones} />
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Sin cliente asignado.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Row({
  label,
  value,
  bold = false,
}: {
  label: string
  value: string
  bold?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn("text-right", bold ? "font-semibold" : "font-medium")}
      >
        {value}
      </span>
    </div>
  )
}
