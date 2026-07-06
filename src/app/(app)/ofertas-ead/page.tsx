import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/shared/page-shell";

export default function OfertasEadPage() {
  return (
    <PageShell title="Ofertas EAD" description="Tabela de campanha automatizada para cursos 100% online com mensalidade, matricula, vencimento e observacoes vigentes.">
      <Card>
        <h2 className="text-lg font-semibold">Oferta automatica controlada</h2>
        <p className="mt-2 text-sm text-slate-500">Somente cursos EAD cadastrados aqui podem receber valor automatico pela IA.</p>
      </Card>
    </PageShell>
  );
}
