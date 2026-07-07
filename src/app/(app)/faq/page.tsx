import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/shared/page-shell";
import { FaqService } from "@/server/services/faq-service";

export default async function FAQPage() {
  const data = await new FaqService().getPanelData();

  return (
    <PageShell title="FAQ" description="Base institucional para respostas frequentes sobre MEC, diploma, provas, portal, TCC, estagio e documentos.">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <h2 className="text-lg font-semibold">Regras e respostas para a IA</h2>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Aqui ficam as perguntas que a IA deve consultar antes de responder o aluno.</p>

          <div className="mt-6 space-y-4">
            {data.faqItems.map((item) => (
              <div key={item.id} className="rounded-[24px] border border-[hsl(var(--border))] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">{item.category}</p>
                <p className="mt-2 font-semibold">{item.question}</p>
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{item.answer}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Base de conhecimento complementar</h2>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Documentos internos, instrucoes comerciais e regras extras para consulta.</p>

          <div className="mt-6 space-y-4">
            {data.knowledgeDocuments.map((document) => (
              <div key={document.id} className="rounded-[24px] border border-[hsl(var(--border))] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">{document.category}</p>
                <p className="mt-2 font-semibold">{document.title}</p>
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{document.content}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
