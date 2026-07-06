import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageSquareText, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-10">
      <section className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800">
            <Sparkles className="h-4 w-4" />
            CRM com IA + WhatsApp + Z-API
          </div>
          <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-slate-950">
            Atendimento comercial em tempo real para matriculas com IA segura, memoria de contexto e operacao humana integrada.
          </h1>
          <p className="max-w-2xl text-lg text-slate-600">
            Plataforma profissional inspirada no WhatsApp Web para qualificar leads, preservar historico, transferir operadores e controlar toda a jornada de matricula.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/login">
                Acessar sistema
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard">Ver painel</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <MessageSquareText className="h-5 w-5 text-blue-800" />
              <p className="mt-3 font-semibold">Conversas persistentes</p>
              <p className="mt-2 text-sm text-slate-500">Toda mensagem recebida pela Z-API fica armazenada e auditavel.</p>
            </Card>
            <Card>
              <ShieldCheck className="h-5 w-5 text-blue-800" />
              <p className="mt-3 font-semibold">Seguranca operacional</p>
              <p className="mt-2 text-sm text-slate-500">JWT proprio, rate limit, trilha de auditoria e controle de sessao.</p>
            </Card>
            <Card>
              <CheckCircle2 className="h-5 w-5 text-blue-800" />
              <p className="mt-3 font-semibold">Fluxo fiel ao PDF</p>
              <p className="mt-2 text-sm text-slate-500">Oferta automatica apenas no EAD e transferencia inteligente para operador.</p>
            </Card>
          </div>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="bg-slate-950 p-6 text-white">
            <div className="flex items-center gap-4">
              <Image src={siteConfig.logoPath} alt="ALFFA Educação" width={80} height={80} className="rounded-full border border-white/10" />
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-blue-200">Canal parceiro oficial</p>
                <h2 className="mt-2 text-2xl font-semibold">ALFFA Educacao | Anhanguera</h2>
              </div>
            </div>
          </div>
          <div className="space-y-4 p-6">
            <div className="rounded-[24px] bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Modulos incluidos</p>
              <p className="mt-2 text-sm text-slate-500">
                Dashboard, Conversas, Leads, Operadores, IA, Cursos, Ofertas EAD, Beneficios, FAQ, Empresas, Configuracoes, Usuarios, Permissoes, Logs, Auditoria e Perfil.
              </p>
            </div>
            <div className="rounded-[24px] bg-orange-50 p-4">
              <p className="text-sm font-semibold text-orange-900">Regras da IA</p>
              <p className="mt-2 text-sm text-orange-700">
                Nunca inventar respostas, consultar base de conhecimento, manter contexto, fazer uma pergunta por vez e parar ao assumir operador.
              </p>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
