import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { GuiaReciente } from "../dashboard.types"

interface RecentGuidesTableProps {
  data: GuiaReciente[]
}

function formatearMoneda(valor: number | null) {
  if (valor === null) return "—"

  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(valor)
}

function formatearFecha(fecha: Date) {
  return new Date(fecha).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

const ESTADO_VARIANT: Record<
  GuiaReciente["estado"],
  "default" | "secondary" | "destructive"
> = {
  ALMACENADO: "default",
  RETIRADO: "secondary",
  ANULADO: "destructive",
}

const ESTADO_PAGO_VARIANT: Record<
  GuiaReciente["estadoPago"],
  "default" | "secondary"
> = {
  PAGADO: "default",
  PENDIENTE: "secondary",
}

export function RecentGuidesTable({ data }: RecentGuidesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Guías recientes</CardTitle>
        <CardDescription>Últimos internamientos registrados</CardDescription>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Aún no hay guías registradas
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Guía</TableHead>
                <TableHead>Contenedor</TableHead>
                <TableHead>Ingreso</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.map((guia) => (
                <TableRow key={guia.id}>
                  <TableCell className="font-medium">
                    {guia.numeroGuia}
                  </TableCell>

                  <TableCell>
                    <span className="flex flex-col">
                      <span>{guia.numeroContenedor}</span>
                      <span className="text-xs text-muted-foreground">
                        {guia.tipoContenedor}
                      </span>
                    </span>
                  </TableCell>

                  <TableCell>{formatearFecha(guia.fechaIngreso)}</TableCell>

                  <TableCell>
                    <Badge variant={ESTADO_VARIANT[guia.estado]}>
                      {guia.estado}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge variant={ESTADO_PAGO_VARIANT[guia.estadoPago]}>
                      {guia.estadoPago}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    {formatearMoneda(guia.montoTotal)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
