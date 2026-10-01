import { ReporteMovimientos } from "@/modules/movimientos/components/reporte-movimientos"

export default function ReporteMovimientosPage() {
  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Movimientos del almacén</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Consulta todo el historial de entradas y salidas o filtra por periodo.
        </p>
      </header>
      <ReporteMovimientos />
    </div>
  )
}
