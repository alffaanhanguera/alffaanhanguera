export function PageShell({
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return <section className="space-y-6">{children}</section>;
}
