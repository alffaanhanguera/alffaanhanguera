import { MetricCard } from "@/components/dashboard/metric-card";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/shared/page-shell";
import { DashboardService } from "@/server/services/dashboard-service";

export default async function DashboardPage() {
  const data = await new DashboardService().getSummary();

  return (
    <PageShell title="Dashboard comercial" description="Visao executiva do funil, operacao do WhatsApp, performance da IA e produtividade dos operadores.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Leads por dia</h2>
          <div className="mt-6 flex items-end gap-3">
            {data.charts.leadConversion.map((value, index) => (
              <div key={value} className="flex-1">
                <div className="rounded-t-3xl bg-blue-800" style={{ height: `${value * 2}px` }} />
                <p className="mt-2 text-center text-xs text-slate-500">D{index + 1}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Tempo medio de resposta (min)</h2>
          <div className="mt-6 flex items-end gap-3">
            {data.charts.responseTime.map((value, index) => (
              <div key={value} className="flex-1">
                <div className="rounded-t-3xl bg-orange-500" style={{ height: `${value * 60}px` }} />
                <p className="mt-2 text-center text-xs text-slate-500">D{index + 1}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
