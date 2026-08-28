import { getDashboardData } from "@/modules/dashboard/dashboard.queries";
import { DashboardView } from "@/modules/dashboard/dashboard-view";

export default async function AdminPage() {
  const data = await getDashboardData();

  return (
    <div className="flex flex-col gap-1 p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Resumen general del almacén de contenedores
        </p>
      </div>
      <DashboardView data={data} />
    </div>
  );
}
