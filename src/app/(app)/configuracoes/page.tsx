import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/shared/page-shell";
import { SettingsService } from "@/server/services/settings-service";

export default async function ConfiguracoesPage() {
  const settings = await new SettingsService().getPanelData();

  return (
    <PageShell title="Configuracoes" description="Central unica para OpenAI, Z-API, politicas da IA, dominios, webhooks, mensagens automaticas e parametros operacionais.">
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">OpenAI</h2>
          <p className="mt-2 text-sm text-slate-500">Assistente: {settings.ai.assistantName}</p>
          <p className="mt-2 text-sm text-slate-500">Prompt base: {settings.ai.systemPrompt}</p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Z-API</h2>
          <p className="mt-2 text-sm text-slate-500">Instance ID: {settings.zapi.instanceId || "Pendente"}</p>
          <p className="mt-2 text-sm text-slate-500">Conexao: {settings.zapi.isConnected ? "Ativa" : "Nao configurada"}</p>
        </Card>
      </div>
    </PageShell>
  );
}
