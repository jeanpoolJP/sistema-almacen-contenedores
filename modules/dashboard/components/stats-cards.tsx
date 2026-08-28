import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Container,
  LogIn,
  LogOut,
  Wallet,
  CircleDollarSign,
  Users,
} from "lucide-react";
import type { DashboardStats } from "../dashboard.types";

interface StatsCardsProps {
  stats: DashboardStats;
}

function formatearMoneda(valor: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(valor);
}

export function StatsCards({ stats }: StatsCardsProps) {
  const items = [
    {
      titulo: "Contenedores almacenados",
      valor: stats.contenedoresAlmacenados.toString(),
      descripcion: "Actualmente en el almacén",
      icono: Container,
    },
    {
      titulo: "Ingresos hoy",
      valor: stats.ingresosHoy.toString(),
      descripcion: "Contenedores ingresados hoy",
      icono: LogIn,
    },
    {
      titulo: "Salidas hoy",
      valor: stats.salidasHoy.toString(),
      descripcion: "Contenedores retirados hoy",
      icono: LogOut,
    },
    {
      titulo: "Por cobrar",
      valor: formatearMoneda(stats.montoPorCobrar),
      descripcion: "Pagos pendientes",
      icono: Wallet,
    },
    {
      titulo: "Cobrado este mes",
      valor: formatearMoneda(stats.montoCobradoMes),
      descripcion: "Ingresos del mes actual",
      icono: CircleDollarSign,
    },
    {
      titulo: "Clientes activos",
      valor: stats.clientesActivos.toString(),
      descripcion: `${stats.guiasDelMes} guías este mes`,
      icono: Users,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {items.map((item) => (
        <Card key={item.titulo}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.titulo}
            </CardTitle>
            <item.icono className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{item.valor}</div>
            <p className="text-xs text-muted-foreground">{item.descripcion}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
