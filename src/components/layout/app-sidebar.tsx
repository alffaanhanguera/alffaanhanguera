"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, Brain, Building2, CircleHelp, Cog, LayoutDashboard, Logs, MessageCircleMore, Network, Shield, UserCircle2, UserCog, Users } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const iconMap = {
  LayoutDashboard,
  MessageCircleMore,
  Users,
  UserCog,
  Brain,
  BookOpen,
  BarChart3,
  CircleHelp,
  Building2,
  Cog,
  Network,
  Shield,
  Logs,
  UserCircle2
};

const items: Array<{ label: string; href: Route; icon: string }> = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Conversas", href: "/conversas", icon: "MessageCircleMore" },
  { label: "Leads", href: "/leads", icon: "Users" },
  { label: "Operadores", href: "/operadores", icon: "UserCog" },
  { label: "IA", href: "/ia", icon: "Brain" },
  { label: "N8N", href: "/n8n", icon: "Network" },
  { label: "Cursos", href: "/cursos", icon: "BookOpen" },
  { label: "Ofertas EAD", href: "/ofertas-ead", icon: "BarChart3" },
  { label: "Beneficios", href: "/beneficios", icon: "Shield" },
  { label: "FAQ", href: "/faq", icon: "CircleHelp" },
  { label: "Empresas", href: "/empresas-conveniadas", icon: "Building2" },
  { label: "Configuracoes", href: "/configuracoes", icon: "Cog" },
  { label: "Usuarios", href: "/usuarios", icon: "Users" },
  { label: "Permissoes", href: "/permissoes", icon: "Shield" },
  { label: "Logs", href: "/logs", icon: "Logs" },
  { label: "Auditoria", href: "/auditoria", icon: "Shield" },
  { label: "Perfil", href: "/perfil", icon: "UserCircle2" }
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass-panel hidden h-[calc(100vh-2rem)] w-[290px] shrink-0 flex-col overflow-hidden p-4 lg:flex">
      <div className="flex items-center gap-3 rounded-[24px] bg-slate-950 px-4 py-3 text-white">
        <Image src={siteConfig.logoPath} alt="ALFFA Educação" width={48} height={48} className="rounded-full" />
        <div>
          <p className="text-sm font-semibold">{siteConfig.name}</p>
          <p className="text-xs text-slate-300">Canal parceiro oficial</p>
        </div>
      </div>

      <nav className="mt-6 flex-1 space-y-1 overflow-y-auto pr-1">
        {items.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap];
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                active ? "bg-blue-900 text-white shadow-lg" : "text-slate-700 hover:bg-white hover:shadow-sm"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
