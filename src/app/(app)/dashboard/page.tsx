import { CourseSalesChart } from "@/components/dashboard/course-sales-chart";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/shared/page-shell";
import { DashboardService } from "@/server/services/dashboard-service";

export default async function DashboardPage() {
  const data = await new DashboardService().getSummary();

  return (
    <PageShell title="Dashboard comercial" description="Visao executiva do funil, operacao do WhatsApp, performance do Chatbot Juliana e produtividade dos operadores.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <h2 className="text-lg font-semibold">Conversao de leads por dia</h2>
          <div className="mt-6 min-h-40">
            {data.charts.leadConversion.every((value) => value === 0) ? (
              <div className="flex h-full min-h-40 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-5 text-center">
                <p className="text-sm text-slate-500">Ainda nao existem leads suficientes para montar o grafico diario.</p>
              </div>
            ) : (
              <div className="flex h-full items-end gap-3">
                {data.charts.leadConversion.map((value, index) => (
                  <div key={`lead-${index}-${value}`} className="flex-1">
                    <div className="rounded-t-3xl bg-blue-800" style={{ height: `${Math.max(value * 2, 12)}px` }} />
                    <p className="mt-2 text-center text-xs text-slate-500">D{index + 1}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Tempo medio de resposta (min)</h2>
          <div className="mt-6 min-h-40">
            {data.charts.responseTime.every((value) => value === 0) ? (
              <div className="flex h-full min-h-40 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-5 text-center">
                <p className="text-sm text-slate-500">O tempo medio aparecera quando houver interacoes completas entre lead e atendimento.</p>
              </div>
            ) : (
              <div className="flex h-full items-end gap-3">
                {data.charts.responseTime.map((value, index) => (
                  <div key={`response-${index}-${value}`} className="flex-1">
                    <div className="rounded-t-3xl bg-orange-500" style={{ height: `${Math.max(value * 60, 12)}px` }} />
                    <p className="mt-2 text-center text-xs text-slate-500">D{index + 1}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      <CourseSalesChart items={data.charts.courseSales} />
    </PageShell>
  );
}
