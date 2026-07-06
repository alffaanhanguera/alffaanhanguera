import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/shared/page-shell";

export default function UsuariosPage() {
  return (
    <PageShell title="Usuarios" description="Cadastro manual de administradores, supervisores e operadores com controle de status, sessoes e papeis.">
      <Card>
        <h2 className="text-lg font-semibold">Perfis do sistema</h2>
        <p className="mt-2 text-sm text-slate-500">A estrutura suporta convites, bloqueio, trilha de acesso e atribuicao fina de permissoes.</p>
      </Card>
    </PageShell>
  );
}
