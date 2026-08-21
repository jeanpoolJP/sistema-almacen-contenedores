// app\admin\page.tsx

import {
  Users,
  FileText,
  Container,
  CreditCard,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statistics = [
  {
    title: "Clientes",
    value: "0",
    description: "Clientes registrados",
    icon: Users,
  },
  {
    title: "Guías",
    value: "0",
    description: "Guías registradas",
    icon: FileText,
  },
  {
    title: "Contenedores",
    value: "0",
    description: "Contenedores almacenados",
    icon: Container,
  },
  {
    title: "Pagos",
    value: "S/ 0.00",
    description: "Pagos registrados",
    icon: CreditCard,
  },
];

export default function AdminPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>

        <p className="text-sm text-muted-foreground">
          Resumen general del almacén de contenedores.
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statistics.map((statistic) => {
          const Icon = statistic.icon;

          return (
            <Card key={statistic.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {statistic.title}
                </CardTitle>

                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold">
                  {statistic.value}
                </div>

                <p className="text-xs text-muted-foreground">
                  {statistic.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Contenido */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              Actividad reciente
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">
              Todavía no hay actividad registrada.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Estado del almacén
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">
              Los datos del almacén aparecerán aquí.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}