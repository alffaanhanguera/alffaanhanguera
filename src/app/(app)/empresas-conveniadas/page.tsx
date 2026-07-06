import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/shared/page-shell";

export default function EmpresasPage() {
  return (
    <PageShell title="Empresas conveniadas" description="Lista de empresas parceiras para sinalizar possiveis beneficios de convenio ao operador.">
      <Card>
        <h2 className="text-lg font-semibold">Convenios monitorados</h2>
        <p className="mt-2 text-sm text-slate-500">O operador recebe a empresa informada pelo lead e conclui a validacao manual do beneficio.</p>
      </Card>
    </PageShell>
  );
}
