import { DataTableCard } from "@/components/shared/data-table-card";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/shared/page-shell";
import { LeadService } from "@/server/services/lead-service";

export default async function LeadsPage() {
  const leads = await new LeadService().listForPanel();

  return (
    <PageShell title="Leads" description="Gestao de pipeline com status comercial, origem, curso, modalidade, beneficios identificados e historico de contato.">
      <Card>
        <h2 className="text-lg font-semibold">Pipeline pronto para qualificacao</h2>
        <p className="mt-2 text-sm text-slate-500">Visao central dos candidatos captados pelo WhatsApp com curso, modalidade, cidade e beneficio mapeado.</p>
      </Card>
      <DataTableCard
        title="Leads captados"
        description="Dados reais do banco sincronizados com o atendimento inicial do chatbot."
        columns={["Nome", "Telefone", "Curso", "Modalidade", "Cidade", "Status", "Beneficio"]}
        rows={leads.map((lead) => [lead.name, lead.phone, lead.course, lead.modality, lead.city, lead.status, lead.benefitSummary])}
      />
    </PageShell>
  );
}
