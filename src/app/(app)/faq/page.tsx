import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/shared/page-shell";

export default function FAQPage() {
  return (
    <PageShell title="FAQ" description="Base institucional para respostas frequentes sobre MEC, diploma, provas, portal, TCC, estagio e documentos.">
      <Card>
        <h2 className="text-lg font-semibold">Conhecimento controlado</h2>
        <p className="mt-2 text-sm text-slate-500">A IA consulta o FAQ para evitar respostas inventadas e manter padrao comercial seguro.</p>
      </Card>
    </PageShell>
  );
}
