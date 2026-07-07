import Image from "next/image";
import { BadgeCheck, Sparkles, Zap } from "lucide-react";
import { LoginForm } from "@/components/forms/login-form";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,59,143,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(242,143,45,0.2),transparent_28%),linear-gradient(180deg,#f8fbff,#eef4fb)]" />
      <div className="absolute left-[-8rem] top-[-8rem] h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="absolute bottom-[-6rem] right-[-4rem] h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />

      <Card className="relative w-full max-w-5xl overflow-hidden p-0">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative bg-slate-950 px-6 py-8 text-white sm:px-10 sm:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.14),transparent_28%)]" />
            <div className="relative">
              <div className="flex items-center gap-4">
                <Image src={siteConfig.logoPath} alt="ALFFA Educação" width={82} height={82} className="rounded-full" />
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-blue-200">CRM IA WhatsApp</p>
                  <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Uma tela simples para entrar e operar tudo.</h1>
                </div>
              </div>

              <p className="mt-8 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                Atendimento comercial com operadores, IA, WhatsApp e funil completo de matricula em uma operacao unica, leve e responsiva.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <Sparkles className="h-5 w-5 text-blue-200" />
                  <p className="mt-3 text-sm font-semibold">Fluxo inteligente</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <Zap className="h-5 w-5 text-orange-300" />
                  <p className="mt-3 text-sm font-semibold">WhatsApp ativo</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <BadgeCheck className="h-5 w-5 text-emerald-300" />
                  <p className="mt-3 text-sm font-semibold">Acesso seguro</p>
                </div>
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center px-5 py-8 sm:px-8 sm:py-10">
            <div className="w-full max-w-md">
              <div className="mb-8 text-center">
                <Image src={siteConfig.logoPath} alt="ALFFA Educação" width={90} height={90} className="mx-auto rounded-full" />
                <h2 className="mt-4 text-3xl font-semibold">Entrar no CRM</h2>
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Login unico, simples, responsivo e otimizado para toda a operacao.</p>
              </div>
              <LoginForm />
            </div>
          </section>
        </div>
      </Card>
    </main>
  );
}
