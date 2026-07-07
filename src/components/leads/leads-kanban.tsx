import { Card } from "@/components/ui/card";

type LeadCard = {
  id: string;
  name: string;
  phone: string;
  course: string;
  modality: string;
  city: string;
  benefitSummary: string;
};

type KanbanColumn = {
  id: string;
  title: string;
  description: string;
  accent: string;
  leads: LeadCard[];
};

export function LeadsKanban({ columns }: { columns: KanbanColumn[] }) {
  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {columns.map((column) => (
        <Card key={column.id} className="p-0">
          <div className="border-b px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{column.title}</h2>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{column.description}</p>
              </div>
              <span className={`h-3 w-3 rounded-full ${column.accent}`} />
            </div>
          </div>

          <div className="space-y-3 p-4">
            {column.leads.length ? (
              column.leads.map((lead) => (
                <div key={lead.id} className="rounded-[24px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
                  <p className="font-semibold">{lead.name}</p>
                  <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{lead.phone}</p>
                  <div className="mt-4 space-y-2 text-sm">
                    <p><span className="font-medium">Curso:</span> {lead.course}</p>
                    <p><span className="font-medium">Modalidade:</span> {lead.modality}</p>
                    <p><span className="font-medium">Cidade:</span> {lead.city}</p>
                    <p><span className="font-medium">Beneficio:</span> {lead.benefitSummary}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-[hsl(var(--border))] p-5 text-sm text-[hsl(var(--muted-foreground))]">
                Nenhum lead nesta etapa no momento.
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
