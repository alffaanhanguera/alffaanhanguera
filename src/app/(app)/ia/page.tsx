import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/shared/page-shell";
import { aiBusinessRules } from "@/server/ai/business-rules";

export default function IAPage() {
  return (
    <PageShell title="Motor de IA" description="Governanca do atendimento automatizado com regras comerciais, base de conhecimento, resumo de operador e politicas de transferencia.">
      <Card>
        <h2 className="text-lg font-semibold">Regras obrigatorias ativas</h2>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          {aiBusinessRules.map((rule) => (
            <li key={rule}>• {rule}</li>
          ))}
        </ul>
      </Card>
    </PageShell>
  );
}
