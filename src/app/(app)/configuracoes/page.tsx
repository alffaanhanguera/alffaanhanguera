import { Card } from "@/components/ui/card";
import { PasswordSettingsForm } from "@/components/settings/password-settings-form";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { PageShell } from "@/components/shared/page-shell";
import { SettingsService } from "@/server/services/settings-service";

export default async function ConfiguracoesPage() {
  await new SettingsService().getPanelData();

  return (
    <PageShell title="Configuracoes" description="Central unica para OpenAI, Z-API, politicas do Chatbot Juliana, dominios, webhooks, mensagens automaticas e parametros operacionais.">
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="min-h-[320px]">
          <h2 className="text-lg font-semibold">Tema</h2>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Alterne entre modo claro e escuro para desktop, tablet e celular.</p>
          <div className="mt-6">
            <ThemeToggle />
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Seguranca do acesso</h2>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Troque sua senha de acesso manual ao CRM sempre que precisar.</p>
          <div className="mt-6">
            <PasswordSettingsForm />
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
