import Image from "next/image";
import { Bell, Search } from "lucide-react";
import { AppMobileNav } from "@/components/layout/app-mobile-nav";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { siteConfig } from "@/config/site";
import { getCurrentSession } from "@/lib/auth/session";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "AD";
}

export async function AppHeader() {
  const session = await getCurrentSession();
  const userName = session?.user.name ?? "Administrador";
  const userRole =
    session?.user.role === "ADMIN"
      ? "Controle total da operacao"
      : session?.user.role === "SUPERVISOR"
        ? "Supervisao comercial"
        : "Operacao de atendimento";

  return (
    <header className="glass-panel flex items-center justify-between gap-4 px-4 py-3">
      <div className="flex items-center gap-3 lg:hidden">
        <AppMobileNav />
        <Image src={siteConfig.logoPath} alt="ALFFA Educação" width={40} height={40} className="rounded-full" />
        <div>
          <p className="text-sm font-semibold">{siteConfig.name}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">CRM comercial</p>
        </div>
      </div>

      <div className="relative hidden max-w-xl flex-1 lg:block">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input className="pl-10" placeholder="Pesquisar leads, conversas, cursos e operadores..." />
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden xl:block">
          <ThemeToggle />
        </div>
        <button className="rounded-full bg-slate-100 p-3 text-slate-600">
          <Bell className="h-4 w-4" />
        </button>
        <div className="hidden text-right md:block">
          <p className="text-sm font-semibold">{userName}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{userRole}</p>
        </div>
        <Avatar fallback={getInitials(userName)} />
      </div>
    </header>
  );
}
