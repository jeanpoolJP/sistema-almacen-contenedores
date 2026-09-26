import { obtenerClientesParaReporte } from "@/modules/reporte-inventario/actions/reporte-inventario.actions";
import { ReporteInventarioForm } from "@/modules/reporte-inventario/components/reporte-inventario-form";

export default async function ReporteInventarioPage() {
  const resultado = await obtenerClientesParaReporte();
  const clientes = resultado.success ? resultado.data : [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reporte de inventario</h1>
        <p className="text-sm text-muted-foreground">
          Genera y descarga el inventario semanal de contenedores por cliente,
          listo para enviar.
        </p>
      </div>

      {!resultado.success && (
        <p className="text-sm text-red-600">{resultado.error}</p>
      )}

      <ReporteInventarioForm clientes={clientes} />
    </div>
  );
}
