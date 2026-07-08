import { FAQManager } from "@/components/faq/faq-manager";
import { PageShell } from "@/components/shared/page-shell";
import { FaqService } from "@/server/services/faq-service";

export default async function FAQPage() {
  const data = await new FaqService().getPanelData();

  return (
    <PageShell title="FAQ" description="Base institucional para respostas frequentes sobre MEC, diploma, provas, portal, TCC, estagio e documentos.">
      <FAQManager initialData={data} />
    </PageShell>
  );
}
