import { LeadsKanban } from "@/components/leads/leads-kanban";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/shared/page-shell";
import { LeadService } from "@/server/services/lead-service";

export default async function LeadsPage() {
  const service = new LeadService();
  const leads = await service.listForPanel();
  const kanban = await service.getKanbanData();

  return (
    <PageShell title="Leads" description="Gestao de pipeline com status comercial, origem, curso, modalidade, beneficios identificados e historico de contato.">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Total no painel</p>
          <p className="mt-3 text-3xl font-semibold">{leads.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Prontos para operador</p>
          <p className="mt-3 text-3xl font-semibold">{kanban.find((column) => column.id === "ready")?.leads.length ?? 0}</p>
        </Card>
        <Card>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Fechamento e vendas</p>
          <p className="mt-3 text-3xl font-semibold">{kanban.find((column) => column.id === "negotiation")?.leads.length ?? 0}</p>
        </Card>
      </div>

      <LeadsKanban columns={kanban} />
    </PageShell>
  );
}
