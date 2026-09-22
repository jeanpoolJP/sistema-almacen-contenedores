// modules\trasegados\components\detalle-guia\detalle-ingreso.tsx

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import type { GuiaTrasegadoDetalle } from "../../types/guia-trasegado-detalle.types"

interface DetalleIngresoProps {
  guia: GuiaTrasegadoDetalle
}

export function DetalleIngreso({ guia }: DetalleIngresoProps) {
  if (guia.ingresos.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Información de ingresos ({guia.ingresos.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {guia.ingresos.map((ingreso, index) => (
          <div key={ingreso.id} className="space-y-5">
            <h3 className="text-sm font-semibold">Ingreso {index + 1}</h3>
            <div className="grid gap-5 md:grid-cols-3">
              <InfoBlock title="Empresa de transporte">
                <InfoLine label="RUC" value={ingreso.empresaTransporte.ruc} />
                <InfoLine
                  label="Nombre"
                  value={ingreso.empresaTransporte.nombre}
                />
                <InfoLine
                  label="Teléfono"
                  value={ingreso.empresaTransporte.telefono ?? "—"}
                />
                <InfoLine
                  label="Contacto logístico"
                  value={ingreso.empresaTransporte.contactoLogistico ?? "—"}
                />
                <InfoLine
                  label="Encargado"
                  value={ingreso.empresaTransporte.nombreEncargado ?? "—"}
                />
              </InfoBlock>
              <InfoBlock title="Vehículo">
                <InfoLine label="Placa" value={ingreso.vehiculo.placa} mono />
                <InfoLine
                  label="Tipo"
                  value={
                    ingreso.vehiculo.tipo
                      ? etiquetaTipoVehiculo(ingreso.vehiculo.tipo)
                      : "—"
                  }
                />
                <InfoLine
                  label="Descripción"
                  value={ingreso.vehiculo.descripcion ?? "—"}
                />
              </InfoBlock>
              <InfoBlock title="Conductor">
                <InfoLine
                  label="Nombre"
                  value={ingreso.conductor.nombreCompleto}
                />
                <InfoLine
                  label="Licencia"
                  value={ingreso.conductor.numeroLicencia}
                  mono
                />
                <InfoLine
                  label="Teléfono"
                  value={ingreso.conductor.telefono ?? "—"}
                />
              </InfoBlock>
            </div>
            {index < guia.ingresos.length - 1 && <Separator />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function etiquetaTipoVehiculo(tipo: string) {
  switch (tipo) {
    case "PORTA_CONTENEDORES":
      return "Porta-contenedores"
    case "CAMA_BAJA":
      return "Cama baja"
    case "OTRO":
      return "Otro"
    default:
      return tipo
  }
}

function InfoBlock({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h4>
      <div className="space-y-1 text-sm">{children}</div>
    </div>
  )
}

function InfoLine({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-sm" : "text-sm"}>{value}</span>
    </div>
  )
}
