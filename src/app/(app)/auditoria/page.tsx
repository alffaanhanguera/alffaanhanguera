import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/shared/page-shell";

export default function AuditoriaPage() {
  return (
    <PageShell title="Auditoria" description="Rastreabilidade de logins, mudancas de configuracao, movimentacoes de conversa e operacoes sensiveis do CRM.">
      <Card>
        <h2 className="text-lg font-semibold">Trilha de auditoria</h2>
        <p className="mt-2 text-sm text-slate-500">As acoes criticas devem ser registradas com usuario, contexto, entidade e timestamp.</p>
      </Card>
    </PageShell>
  );
}
