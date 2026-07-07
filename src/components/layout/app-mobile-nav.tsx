"use client";

import type { Route } from "next";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const items: Array<{ label: string; href: Route }> = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Conversas", href: "/conversas" },
  { label: "Leads", href: "/leads" },
  { label: "N8N", href: "/n8n" },
  { label: "FAQ", href: "/faq" },
  { label: "Operadores", href: "/operadores" },
  { label: "Config.", href: "/configuracoes" }
];

export function AppMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="rounded-full bg-slate-100 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-100 lg:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm lg:hidden">
          <div className="ml-auto h-full w-[84vw] max-w-sm bg-[hsl(var(--card))] p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-[hsl(var(--muted-foreground))]">ALFFA CRM</p>
                <p className="mt-1 text-lg font-semibold">{siteConfig.companyName}</p>
              </div>
              <button
                type="button"
                className="rounded-full bg-slate-100 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-100"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="mt-8 space-y-2">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-2xl px-4 py-3 text-sm font-medium transition",
                    pathname.startsWith(item.href)
                      ? "bg-blue-900 text-white"
                      : "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
