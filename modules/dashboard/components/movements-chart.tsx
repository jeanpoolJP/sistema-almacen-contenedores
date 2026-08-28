"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import type { MovimientoDiario } from "../dashboard.types";

interface MovementsChartProps {
  data: MovimientoDiario[];
}

const chartConfig = {
  ingresos: {
    label: "Ingresos",
    color: "var(--chart-1)",
  },
  salidas: {
    label: "Salidas",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function MovementsChart({ data }: MovementsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimientos del almacén</CardTitle>
        <CardDescription>Ingresos y salidas de los últimos 14 días</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
          <AreaChart data={data} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="fecha"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              tickFormatter={(value: string) =>
                new Date(value).toLocaleDateString("es-PE", {
                  day: "2-digit",
                  month: "short",
                })
              }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("es-PE", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  }
                />
              }
            />
            <defs>
              <linearGradient id="fillIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-ingresos)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-ingresos)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillSalidas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-salidas)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-salidas)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area
              dataKey="ingresos"
              type="monotone"
              fill="url(#fillIngresos)"
              stroke="var(--color-ingresos)"
              stackId="a"
            />
            <Area
              dataKey="salidas"
              type="monotone"
              fill="url(#fillSalidas)"
              stroke="var(--color-salidas)"
              stackId="b"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
