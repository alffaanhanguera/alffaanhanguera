import { DataTableCard } from "@/components/shared/data-table-card";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/shared/page-shell";
import { LogService } from "@/server/services/log-service";

export default async function LogsPage() {
  const logs = await new LogService().getIntegrationLogs();

  return (
    <PageShell title="Logs" description="Monitoramento tecnico de requests, integrações OpenAI/Z-API, status de envio, falhas e observabilidade operacional.">
      <Card>
        <h2 className="text-lg font-semibold">Observabilidade</h2>
        <p className="mt-2 text-sm text-slate-500">Cada evento externo fica disponivel para rastreio, reprocessamento e diagnostico operacional.</p>
      </Card>
      <DataTableCard
        title="Logs de integração"
        description="Chamadas persistidas de Z-API e outros serviços externos."
        columns={["Provider", "Endpoint", "Status", "Mensagem", "Data"]}
        rows={(logs.length ? logs : [{ provider: "system", endpoint: "-", statusCode: 0, message: "Nenhum log encontrado ainda.", createdAt: "-" }]).map((log) => [
          log.provider,
          log.endpoint,
          String(log.statusCode),
          log.message,
          log.createdAt
        ])}
      />
    </PageShell>
  );
}
