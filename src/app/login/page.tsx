import Image from "next/image";
import { LockKeyhole, ShieldCheck, Workflow } from "lucide-react";
import { LoginForm } from "@/components/forms/login-form";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-4">
          <Image src={siteConfig.logoPath} alt="ALFFA Educação" width={88} height={88} className="rounded-full" />
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-200">CRM IA WHATSAPP</p>
            <h1 className="mt-2 text-4xl font-semibold">Operacao comercial com controle total.</h1>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <LockKeyhole className="h-6 w-6 text-orange-400" />
            <p className="mt-4 text-xl font-semibold">JWT proprio e sessoes seguras</p>
            <p className="mt-2 text-sm text-slate-300">Acesso manual sem Clerk, Auth.js ou Supabase Auth, conforme exigencia do projeto.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-white/5 text-white">
              <ShieldCheck className="h-5 w-5 text-blue-200" />
              <p className="mt-3 font-semibold">Auditoria completa</p>
              <p className="mt-2 text-sm text-slate-300">Logs de login, configuracoes, webhooks e transferencias.</p>
            </Card>
            <Card className="bg-white/5 text-white">
              <Workflow className="h-5 w-5 text-blue-200" />
              <p className="mt-3 font-semibold">Fluxo humano + IA</p>
              <p className="mt-2 text-sm text-slate-300">IA qualifica, operador assume o fechamento e os passos manuais.</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-10">
        <Card className="w-full max-w-md p-8">
          <div className="mb-8 text-center">
            <Image src={siteConfig.logoPath} alt="ALFFA Educação" width={90} height={90} className="mx-auto rounded-full" />
            <h2 className="mt-4 text-3xl font-semibold text-slate-950">Entrar no CRM</h2>
            <p className="mt-2 text-sm text-slate-500">Acesso de administradores, supervisores e operadores.</p>
          </div>
          <LoginForm />
        </Card>
      </section>
    </main>
  );
}
