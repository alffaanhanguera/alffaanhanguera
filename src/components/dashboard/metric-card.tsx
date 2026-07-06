import { Card } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  variation
}: {
  label: string;
  value: string;
  variation: string;
}) {
  return (
    <Card>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-emerald-600">{variation}</p>
    </Card>
  );
}
