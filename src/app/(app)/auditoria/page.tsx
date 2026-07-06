import { DataTableCard } from "@/components/shared/data-table-card";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/shared/page-shell";
import { LogService } from "@/server/services/log-service";

export default async function AuditoriaPage() {
  const logs = await new LogService().getAuditLogs();

  return (
    <PageShell title="Auditoria" description="Rastreabilidade de logins, mudancas de configuracao, movimentacoes de conversa e operacoes sensiveis do CRM.">
      <Card>
        <h2 className="text-lg font-semibold">Trilha de auditoria</h2>
        <p className="mt-2 text-sm text-slate-500">As acoes criticas devem ser registradas com usuario, contexto, entidade e timestamp.</p>
      </Card>
      <DataTableCard
        title="Auditoria recente"
        description="Eventos auditaveis da operacao e do sistema."
        columns={["Usuario", "Entidade", "Acao", "Descricao", "Data"]}
        rows={(logs.length
          ? logs
          : [{ user: "Sistema", entity: "-", action: "INFO", description: "Nenhum evento de auditoria encontrado.", createdAt: "-" }]).map((log) => [
          log.user,
          log.entity,
          String(log.action),
          log.description,
          log.createdAt
        ])}
      />
    </PageShell>
  );
}
