import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle } from "lucide-react";
import type { PagoPendiente } from "../dashboard.types";

interface PendingPaymentsCardProps {
  data: PagoPendiente[];
}

function formatearMoneda(valor: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(valor);
}

export function PendingPaymentsCard({ data }: PendingPaymentsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          Pagos pendientes
        </CardTitle>
        <CardDescription>Guías con mayor monto por cobrar</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No hay pagos pendientes
          </p>
        ) : (
          <div className="space-y-1">
            {data.map((pago, index) => (
              <div key={pago.id}>
                <div className="flex items-center justify-between py-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{pago.numeroGuia}</span>
                    <span className="text-xs text-muted-foreground">
                      {pago.clienteNombre}
                      {pago.diasAlmacenamiento !== null &&
                        ` · ${pago.diasAlmacenamiento} días`}
                    </span>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatearMoneda(pago.montoTotal)}
                  </span>
                </div>
                {index < data.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
