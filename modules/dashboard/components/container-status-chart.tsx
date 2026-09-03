"use client"

import { Pie, PieChart, Cell } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import type { DistribucionMedidaContenedor } from "../dashboard.types"

interface ContainerStatusChartProps {
  data: DistribucionMedidaContenedor[]
}

const chartConfig = {
  cantidad: {
    label: "Contenedores",
  },
  "20": {
    label: "20 pies",
    color: "var(--chart-1)",
  },
  "40": {
    label: "40 pies",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ContainerStatusChart({ data }: ContainerStatusChartProps) {
  const total = data.reduce((acc, item) => acc + item.cantidad, 0)

  const chartData = data.map((item) => ({
    medida: String(item.medida),
    cantidad: item.cantidad,
    fill: `var(--color-${item.medida})`,
  }))

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Contenedores por medida</CardTitle>

        <CardDescription>
          Actualmente almacenados ({total} en total)
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        {total === 0 ? (
          <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
            No hay contenedores almacenados
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[260px]"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />

              <Pie
                data={chartData}
                dataKey="cantidad"
                nameKey="medida"
                innerRadius={60}
                strokeWidth={4}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.medida} fill={entry.fill} />
                ))}
              </Pie>

              <ChartLegend content={<ChartLegendContent nameKey="medida" />} />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
