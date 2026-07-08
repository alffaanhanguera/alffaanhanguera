import { OperatorsManager } from "@/components/operators/operators-manager";
import { PageShell } from "@/components/shared/page-shell";
import { OperatorService } from "@/server/services/operator-service";

export default async function OperadoresPage() {
  const data = await new OperatorService().getPanelData();

  return (
    <PageShell title="Operadores" description="Controle de fila, produtividade, especialidade por modalidade, ocupacao e distribuicao de atendimentos.">
      <OperatorsManager initialData={data} />
    </PageShell>
  );
}
