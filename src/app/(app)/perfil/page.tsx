import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/shared/page-shell";

export default function PerfilPage() {
  return (
    <PageShell title="Perfil" description="Ajustes de conta, seguranca, dados do operador, avatar e preferencias pessoais do ambiente.">
      <Card>
        <h2 className="text-lg font-semibold">Conta do usuario</h2>
        <p className="mt-2 text-sm text-slate-500">Espaco reservado para senha, notificacoes, assinatura e informacoes do colaborador.</p>
      </Card>
    </PageShell>
  );
}
