"use client"

import {
  Users,
  FileText,
  Container,
  CreditCard,
  Clock,
  CheckCircle2,
  Warehouse,
  Banknote,
} from "lucide-react"

import type { DashboardStatistics } from "../dashboard.types"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type DashboardStatisticsProps = {
  statistics: DashboardStatistics
}

function formatMoneda(valor: number) {
  return `S/ ${valor.toFixed(2)}`
}

export function DashboardStatistics({ statistics }: DashboardStatisticsProps) {
  const tarjetas = [
    {
      title: "Clientes",
      value: statistics.clientes.toLocaleString("es-PE"),
      description: "Clientes registrados",
      icon: Users,
    },

    {
      title: "Guías",
      value: statistics.guias.toLocaleString("es-PE"),
      description: "Guías activas registradas",
      icon: FileText,
    },

    {
      title: "Contenedores almacenados",
      value: statistics.contenedoresAlmacenados.toLocaleString("es-PE"),
      description: "Actualmente en el almacén",
      icon: Container,
    },

    {
      title: "Total cobrado",
      value: formatMoneda(statistics.totalCobrado),
      description: "Pagos registrados",
      icon: CreditCard,
    },

    {
      title: "Almacenados",
      value: statistics.guiasAlmacenadas.toLocaleString("es-PE"),
      description: "Guías actualmente almacenadas",
      icon: Warehouse,
    },

    {
      title: "Retirados",
      value: statistics.guiasRetiradas.toLocaleString("es-PE"),
      description: "Guías con salida registrada",
      icon: CheckCircle2,
    },

    {
      title: "Pendientes de pago",
      value: statistics.guiasPendientesPago.toLocaleString("es-PE"),
      description: "Guías que aún no han sido pagadas",
      icon: Clock,
    },

    {
      title: "Monto pendiente",
      value: formatMoneda(statistics.montoPendiente),
      description: "Total por cobrar",
      icon: Banknote,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {tarjetas.map((tarjeta) => {
        const Icon = tarjeta.icon

        return (
          <Card key={tarjeta.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {tarjeta.title}
              </CardTitle>

              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold">{tarjeta.value}</div>

              <p className="text-xs text-muted-foreground">
                {tarjeta.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
