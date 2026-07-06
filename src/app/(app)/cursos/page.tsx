import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/shared/page-shell";

export default function CursosPage() {
  return (
    <PageShell title="Cursos" description="Cadastro mestre de cursos, modalidades, turnos, duracao, observacoes comerciais e disponibilidade para oferta automatica.">
      <Card>
        <h2 className="text-lg font-semibold">Base de cursos</h2>
        <p className="mt-2 text-sm text-slate-500">A IA deve consultar esta estrutura antes de oferecer qualquer modalidade ao lead.</p>
      </Card>
    </PageShell>
  );
}
