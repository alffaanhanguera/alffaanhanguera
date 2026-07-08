import { Card } from "@/components/ui/card";

export function CourseSalesChart({
  items,
  title = "Cursos mais vendidos"
}: {
  items: Array<{ course: string; total: number }>;
  title?: string;
}) {
  const max = Math.max(...items.map((item) => item.total), 1);

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Atualizacao com base nos leads matriculados</p>
      </div>

      <div className="mt-8 space-y-4">
        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-center">
            <p className="text-sm font-semibold text-slate-900">Nenhum curso vendido ainda</p>
            <p className="mt-2 text-sm text-slate-500">Assim que houver leads matriculados, o ranking comercial aparecera aqui.</p>
          </div>
        ) : null}

        {items.map((item) => (
          <div key={item.course}>
            <div className="mb-2 flex items-center justify-between gap-4 text-sm">
              <span className="font-medium text-[hsl(var(--foreground))]">{item.course}</span>
              <span className="text-[hsl(var(--muted-foreground))]">{item.total} vendas</span>
            </div>
            <div className="h-3 rounded-full bg-[hsl(var(--muted))]">
              <div
                className="h-3 rounded-full bg-[linear-gradient(90deg,#0f3b8f,#f28f2d)]"
                style={{ width: `${Math.max((item.total / max) * 100, 12)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
