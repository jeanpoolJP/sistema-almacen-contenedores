"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

import type { IngresoMensualGuias } from "../../estadisticas.types"

interface IngresosMensualesGuiasChartProps {
  data: IngresoMensualGuias[]
}

const chartConfig = {
  generado: {
    label: "Generado",
    color: "var(--chart-1)",
  },
  cobrado: {
    label: "Cobrado",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

function formatearMoneda(valor: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(valor)
}

function formatearEje(valor: number) {
  return new Intl.NumberFormat("es-PE", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(valor)
}

export function IngresosMensualesGuiasChart({
  data,
}: IngresosMensualesGuiasChartProps) {
  const anchoGrafica = Math.max(760, data.length * 76)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresos por mes</CardTitle>
        <CardDescription>
          Montos de guías por fecha de salida en los últimos 12 meses,
          independientes del periodo de las tarjetas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="overflow-x-auto">
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[320px]"
              style={{ width: `${anchoGrafica}px` }}
            >
              <BarChart data={data} margin={{ left: 8, right: 12, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="mes"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  width={58}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(valor: number) => formatearEje(valor)}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(valor) => formatearMoneda(Number(valor))}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="generado"
                  fill="var(--color-generado)"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="cobrado"
                  fill="var(--color-cobrado)"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </div>
        ) : (
          <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
            No hay ingresos para mostrar en los últimos 12 meses.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
