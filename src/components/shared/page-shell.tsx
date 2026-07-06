import { Card } from "@/components/ui/card";

export function PageShell({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <Card className="bg-slate-950 text-white">
        <p className="text-sm uppercase tracking-[0.2em] text-blue-200">CRM IA + WhatsApp</p>
        <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">{description}</p>
      </Card>
      {children}
    </section>
  );
}
