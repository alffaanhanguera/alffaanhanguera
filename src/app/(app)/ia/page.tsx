import { Card } from "@/components/ui/card";
import { JulianaFlowTester } from "@/components/ai/juliana-flow-tester";
import { PageShell } from "@/components/shared/page-shell";
import { aiBusinessRules } from "@/server/ai/business-rules";

export default function IAPage() {
  return (
    <PageShell title="Motor de IA" description="Governanca do atendimento automatizado com regras comerciais, base de conhecimento, resumo de operador e politicas de transferencia.">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Card>
          <h2 className="text-lg font-semibold">Regras obrigatorias ativas</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {aiBusinessRules.map((rule) => (
              <li key={rule}>• {rule}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Simulador da Juliana</h2>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            Teste o fluxo completo da Juliana sem depender do WhatsApp ou de outro celular.
          </p>
          <div className="mt-6">
            <JulianaFlowTester />
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
