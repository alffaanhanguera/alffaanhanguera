import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/shared/page-shell";
import { DashboardService } from "@/server/services/dashboard-service";
import { SettingsService } from "@/server/services/settings-service";

export default async function N8NPage() {
  const [dashboard, settings] = await Promise.all([new DashboardService().getSummary(), new SettingsService().getPanelData()]);

  return (
    <PageShell title="N8N" description="Central para criar agentes, desenhar fluxos de mensagens, acompanhar cursos vendidos e organizar automacoes no estilo operacional da Alffa Fibra.">
      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <p className="text-sm uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">Agentes</p>
          <h2 className="mt-2 text-xl font-semibold">Base pronta para orquestracao</h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-[24px] border border-[hsl(var(--border))] p-4">
              <p className="font-semibold">Agente comercial IA</p>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Nome atual: {settings.ai.assistantName}</p>
            </div>
            <div className="rounded-[24px] border border-[hsl(var(--border))] p-4">
              <p className="font-semibold">Fluxo WhatsApp</p>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Captura dados, qualifica, gera resumo e transfere para operador.</p>
            </div>
            <div className="rounded-[24px] border border-[hsl(var(--border))] p-4">
              <p className="font-semibold">Cursos vendidos</p>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Visual pronto para disparar automacoes com base nas matriculas.</p>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-sm uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">Fluxo visual</p>
          <h2 className="mt-2 text-xl font-semibold">Mapa operacional do atendimento</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] bg-blue-900 p-5 text-white">
              <p className="text-sm uppercase tracking-[0.18em] text-blue-200">Entrada</p>
              <p className="mt-2 font-semibold">Webhook Z-API</p>
              <p className="mt-2 text-sm text-blue-100">Recebe mensagem, salva no banco e aciona o motor comercial.</p>
            </div>
            <div className="rounded-[24px] bg-orange-500 p-5 text-white">
              <p className="text-sm uppercase tracking-[0.18em] text-orange-100">Qualificação</p>
              <p className="mt-2 font-semibold">Fluxo IA</p>
              <p className="mt-2 text-sm text-orange-50">Pergunta por pergunta, com contexto, memoria e restricoes do PDF.</p>
            </div>
            <div className="rounded-[24px] bg-emerald-600 p-5 text-white">
              <p className="text-sm uppercase tracking-[0.18em] text-emerald-100">Fechamento</p>
              <p className="mt-2 font-semibold">Operador / venda</p>
              <p className="mt-2 text-sm text-emerald-50">Encaminha para humano e permite medir cursos vendidos.</p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {dashboard.charts.courseSales.map((item) => (
              <div key={item.course} className="flex items-center justify-between rounded-[20px] bg-[hsl(var(--muted))] px-4 py-3">
                <span className="font-medium">{item.course}</span>
                <span className="text-sm text-[hsl(var(--muted-foreground))]">{item.total} vendas</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
