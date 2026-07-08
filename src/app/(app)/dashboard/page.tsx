import { CourseSalesChart } from "@/components/dashboard/course-sales-chart";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/shared/page-shell";
import { formatDate } from "@/lib/utils";
import { DashboardService } from "@/server/services/dashboard-service";

const filters = [
  { value: "7d", label: "Ultimos 7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
  { value: "6m", label: "Semestral" },
  { value: "1y", label: "Anual" }
] as const;

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: Promise<{ periodo?: "7d" | "30d" | "90d" | "6m" | "1y" }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const activeFilter = filters.some((filter) => filter.value === params?.periodo) ? params?.periodo ?? "7d" : "7d";
  const data = await new DashboardService().getSummary(activeFilter);

  return (
    <PageShell title="Dashboard comercial" description="Visao executiva do funil, operacao do WhatsApp, performance do Chatbot Juliana e produtividade dos operadores.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <CourseSalesChart items={data.charts.courseSales} title="Cursos mais vendidos" />

        <Card>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Ultimos leads recebidos</h2>
              <p className="mt-1 text-sm text-slate-500">Relatorio com os leads que chegaram pelo WhatsApp no periodo selecionado.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <a
                  key={filter.value}
                  href={`/dashboard?periodo=${filter.value}`}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeFilter === filter.value ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {filter.label}
                </a>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {data.latestLeads.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-center text-sm text-slate-500">
                Nenhum lead chegou neste periodo.
              </div>
            ) : (
              data.latestLeads.map((lead) => (
                <div key={lead.id} className="rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{lead.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{lead.phone}</p>
                    </div>
                    <p className="text-sm text-slate-500">{formatDate(lead.createdAt)}</p>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    <p><span className="font-medium text-slate-900">Curso:</span> {lead.course}</p>
                    <p><span className="font-medium text-slate-900">Cidade:</span> {lead.city}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
