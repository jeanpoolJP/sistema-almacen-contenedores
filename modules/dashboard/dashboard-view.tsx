import { StatsCards } from "./components/stats-cards";
import { ContainerStatusChart } from "./components/container-status-chart";
import { MovementsChart } from "./components/movements-chart";
import { RevenueChart } from "./components/revenue-chart";
import { RecentGuidesTable } from "./components/recent-guides-table";
import { PendingPaymentsCard } from "./components/pending-payments-card";
import type { DashboardData } from "./dashboard.types";

interface DashboardViewProps {
  data: DashboardData;
}

export function DashboardView({ data }: DashboardViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <StatsCards stats={data.stats} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MovementsChart data={data.movimientosDiarios} />
        </div>
        <ContainerStatusChart data={data.distribucionContenedores} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentGuidesTable data={data.guiasRecientes} />
        </div>
        <PendingPaymentsCard data={data.pagosPendientes} />
      </div>

      <RevenueChart data={data.ingresosMensuales} />
    </div>
  );
}
