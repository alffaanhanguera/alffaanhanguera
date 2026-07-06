import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/shared/page-shell";

export default function PermissoesPage() {
  return (
    <PageShell title="Permissoes" description="Modelo granular para limitar acesso por modulo, acao administrativa, auditoria e operacao de atendimento.">
      <Card>
        <h2 className="text-lg font-semibold">Seguranca por papel</h2>
        <p className="mt-2 text-sm text-slate-500">Administrador, supervisor e operador recebem escopos separados e expansiveis.</p>
      </Card>
    </PageShell>
  );
}
