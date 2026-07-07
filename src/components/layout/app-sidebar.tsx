"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp, Cog, LayoutDashboard, MessageCircleMore, Network, UserCog, Users } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const iconMap = {
  LayoutDashboard,
  MessageCircleMore,
  Users,
  UserCog,
  CircleHelp,
  Cog,
  Network
};

const items: Array<{ label: string; href: Route; icon: string }> = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Conversas", href: "/conversas", icon: "MessageCircleMore" },
  { label: "Leads", href: "/leads", icon: "Users" },
  { label: "N8N", href: "/n8n", icon: "Network" },
  { label: "FAQ", href: "/faq", icon: "CircleHelp" },
  { label: "Operadores", href: "/operadores", icon: "UserCog" },
  { label: "Configuracoes", href: "/configuracoes", icon: "Cog" }
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
