import { Card } from "@/components/ui/card";
import { DataTableCard } from "@/components/shared/data-table-card";
import { PageShell } from "@/components/shared/page-shell";
import { OperatorService } from "@/server/services/operator-service";

export default async function OperadoresPage() {
  const data = await new OperatorService().getPanelData();

  return (
    <PageShell title="Operadores" description="Controle de fila, produtividade, especialidade por modalidade, ocupacao e distribuicao de atendimentos.">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Total de acessos</p>
          <p className="mt-3 text-3xl font-semibold">{data.summary.total}</p>
        </Card>
        <Card>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Admins</p>
          <p className="mt-3 text-3xl font-semibold">{data.summary.admins}</p>
        </Card>
        <Card>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Supervisores</p>
          <p className="mt-3 text-3xl font-semibold">{data.summary.supervisors}</p>
        </Card>
        <Card>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Operadores</p>
          <p className="mt-3 text-3xl font-semibold">{data.summary.operators}</p>
        </Card>
      </div>

      <DataTableCard
        title="Squad operacional"
        description="Equipe com perfis de acesso, fila de conversas e permissões do CRM."
        columns={["Nome", "E-mail", "Perfil", "Status", "Conversas", "Permissões"]}
        rows={data.users.map((user) => [
          user.name,
          user.email,
          user.role,
          user.status,
          String(user.conversations),
          user.permissions.join(", ")
        ])}
      />
    </PageShell>
  );
}
