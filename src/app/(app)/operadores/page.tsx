import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/shared/page-shell";

export default function OperadoresPage() {
  return (
    <PageShell title="Operadores" description="Controle de fila, produtividade, especialidade por modalidade, ocupacao e distribuicao de atendimentos.">
      <Card>
        <h2 className="text-lg font-semibold">Squad operacional</h2>
        <p className="mt-2 text-sm text-slate-500">Modulo desenhado para acompanhar assumidos, pausas, transferencias e fechamento por operador.</p>
      </Card>
    </PageShell>
  );
}
