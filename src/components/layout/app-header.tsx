import Image from "next/image";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { siteConfig } from "@/config/site";

export function AppHeader() {
  return (
    <header className="glass-panel flex items-center justify-between gap-4 px-4 py-3">
      <div className="flex items-center gap-3 lg:hidden">
        <Image src={siteConfig.logoPath} alt="ALFFA Educação" width={40} height={40} className="rounded-full" />
        <div>
          <p className="text-sm font-semibold">{siteConfig.name}</p>
          <p className="text-xs text-slate-500">CRM comercial</p>
        </div>
      </div>

      <div className="relative hidden max-w-xl flex-1 lg:block">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input className="pl-10" placeholder="Pesquisar leads, conversas, cursos e operadores..." />
      </div>

      <div className="flex items-center gap-4">
        <button className="rounded-full bg-slate-100 p-3 text-slate-600">
          <Bell className="h-4 w-4" />
        </button>
        <div className="hidden text-right md:block">
          <p className="text-sm font-semibold">Administrador</p>
          <p className="text-xs text-slate-500">Controle total da operacao</p>
        </div>
        <Avatar fallback="AD" />
      </div>
    </header>
  );
}
