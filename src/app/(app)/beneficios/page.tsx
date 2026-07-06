import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/shared/page-shell";

export default function BeneficiosPage() {
  return (
    <PageShell title="Beneficios" description="Catalogo de beneficios identificaveis pela IA, sem calculo automatico de bolsa ou desconto.">
      <Card>
        <h2 className="text-lg font-semibold">Regras de beneficios</h2>
        <p className="mt-2 text-sm text-slate-500">ENEM, convenio empresa, transferencia e segunda graduacao ficam sinalizados para analise humana.</p>
      </Card>
    </PageShell>
  );
}
