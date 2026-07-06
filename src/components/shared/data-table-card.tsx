import { Card } from "@/components/ui/card";

export function DataTableCard({
  title,
  description,
  columns,
  rows
}: {
  title: string;
  description: string;
  columns: string[];
  rows: string[][];
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b px-6 py-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-6 py-3 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t">
                {row.map((cell, cellIndex) => (
                  <td key={`${rowIndex}-${cellIndex}`} className="px-6 py-4 text-slate-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
