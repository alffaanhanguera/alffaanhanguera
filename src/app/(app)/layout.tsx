import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { LiveDataSync } from "@/components/shared/live-data-sync";
import { getCurrentSession } from "@/lib/auth/session";

export default async function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen p-4 lg:p-6">
      <LiveDataSync />
      <div className="mx-auto flex max-w-[1800px] gap-4">
        <AppSidebar />
        <div className="flex-1 space-y-4">
          <AppHeader />
          {children}
        </div>
      </div>
    </main>
  );
}
