import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/shared/page-shell";

export default function LogsPage() {
  return (
    <PageShell title="Logs" description="Monitoramento tecnico de requests, integrações OpenAI/Z-API, status de envio, falhas e observabilidade operacional.">
      <Card>
        <h2 className="text-lg font-semibold">Observabilidade</h2>
        <p className="mt-2 text-sm text-slate-500">Cada evento externo pode ser persistido para rastreio, reprocessamento e diagnostico.</p>
      </Card>
    </PageShell>
  );
}
