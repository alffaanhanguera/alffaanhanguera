import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/shared/page-shell";

export default function LeadsPage() {
  return (
    <PageShell title="Leads" description="Gestao de pipeline com status comercial, origem, curso, modalidade, beneficios identificados e historico de contato.">
      <Card>
        <h2 className="text-lg font-semibold">Pipeline pronto para qualificacao</h2>
        <p className="mt-2 text-sm text-slate-500">Estrutura preparada para segmentar leads por status, curso, modalidade, campanha, operador e SLA.</p>
      </Card>
    </PageShell>
  );
}
