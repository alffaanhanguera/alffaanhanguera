import Image from "next/image";
import { Activity, Lock, MessageCircleMore, Sparkles } from "lucide-react";
import { LoginForm } from "@/components/forms/login-form";
import { siteConfig } from "@/config/site";

const featureCards = [
  {
    title: "Fluxo\ninteligente",
    description: "Atendimentos organizados e com respostas automáticas.",
    icon: Sparkles,
    iconClassName: "text-cyan-300"
  },
  {
    title: "WhatsApp\nintegrado",
    description: "Conecte sua conta e gerencie conversas em tempo real.",
    icon: MessageCircleMore,
    iconClassName: "text-emerald-300"
  },
  {
    title: "Acesso\nseguro",
    description: "Seus dados protegidos com tecnologia de ponta a ponta.",
    icon: Lock,
    iconClassName: "text-violet-300"
  }
];

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(34,112,255,0.4),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(17,88,212,0.35),transparent_26%),linear-gradient(135deg,#0036a8_0%,#02112f_30%,#031020_100%)] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(66,153,255,0.18),transparent_34%),radial-gradient(circle_at_bottom,rgba(37,99,235,0.22),transparent_38%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1570px] items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(3,11,26,0.96),rgba(7,18,43,0.96))] shadow-[0_24px_80px_rgba(2,8,24,0.55)] lg:min-h-[780px] lg:grid-cols-[1.28fr_0.92fr]">
          <section className="relative overflow-hidden border-b border-white/10 px-6 py-8 text-white sm:px-8 sm:py-10 lg:border-b-0 lg:border-r lg:px-16 lg:py-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(46,130,255,0.22),transparent_18%),linear-gradient(180deg,rgba(3,10,24,0.38),rgba(3,10,24,0.12))]" />
            <div className="absolute inset-y-0 left-0 w-full bg-[radial-gradient(circle_at_12%_35%,rgba(40,131,255,0.38),transparent_0.9%,transparent_2.4%),radial-gradient(circle_at_15%_55%,rgba(40,131,255,0.32),transparent_0.8%,transparent_2.1%),radial-gradient(circle_at_8%_75%,rgba(40,131,255,0.26),transparent_0.8%,transparent_2.2%),linear-gradient(120deg,rgba(33,96,215,0.24),transparent_26%)] opacity-90" />
            <div className="absolute inset-y-0 left-0 w-[48%] bg-[linear-gradient(90deg,rgba(20,85,210,0.32),rgba(20,85,210,0.08),transparent)]" />

            <div className="relative flex h-full flex-col">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start lg:gap-8">
                <div className="shrink-0">
                  <Image
                    src={siteConfig.logoPath}
                    alt="ALFFA Educação"
                    width={148}
                    height={148}
                    className="h-24 w-24 object-contain sm:h-28 sm:w-28 lg:h-36 lg:w-36"
                  />
                </div>

                <div className="max-w-[620px] pt-1">
                  <p className="text-sm uppercase tracking-[0.34em] text-[#2da3ff] sm:text-base">Sistema Alffa Educa</p>
                  <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl lg:text-[4.2rem]">
                    Gerenciamento em
                    <span className="mt-2 block text-[#2d94ff]">tempo real.</span>
                  </h1>
                  <p className="mt-8 max-w-[620px] text-lg leading-9 text-white/92 sm:text-xl">
                    Atendimento comercial com operadores, chatbot, WhatsApp e funil completo de matrícula em uma operação
                    única, leve e responsiva.
                  </p>
                </div>
              </div>

              <div className="my-8 h-px w-full bg-[linear-gradient(90deg,transparent,rgba(60,150,255,0.95),transparent)] shadow-[0_0_22px_rgba(34,137,255,0.7)] sm:my-10 lg:mt-7 lg:mb-10" />

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {featureCards.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <div
                      key={feature.title}
                      className="rounded-[26px] border border-[#18478f] bg-[linear-gradient(180deg,rgba(8,20,46,0.88),rgba(4,13,31,0.94))] px-7 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                    >
                      <Icon className={`h-9 w-9 ${feature.iconClassName}`} strokeWidth={1.8} />
                      <h2 className="mt-7 whitespace-pre-line text-[2rem] font-semibold leading-[1.05] tracking-[-0.03em] text-white">
                        {feature.title}
                      </h2>
                      <p className="mt-6 text-lg leading-8 text-white/78">{feature.description}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 grid gap-5 border-t border-white/8 pt-6 text-white/86 sm:grid-cols-2 lg:mt-auto lg:pt-8">
                <div className="flex items-start gap-4">
                  <div className="mt-1 rounded-xl border border-[#2858a3] bg-[#071632] p-2.5 text-[#5aa8ff]">
                    <Lock className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">Segurança e privacidade</p>
                    <p className="mt-1 text-base text-white/60">Seus dados protegidos com criptografia</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="mt-1 rounded-xl border border-[#2858a3] bg-[#071632] p-2.5 text-[#5aa8ff]">
                    <Activity className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">Alta performance</p>
                    <p className="mt-1 text-base text-white/60">Sistema rápido, estável e escalável</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="relative flex items-center bg-[linear-gradient(180deg,rgba(10,24,54,0.96),rgba(7,18,42,0.98))] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 xl:px-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(42,108,230,0.22),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]" />
            <div className="relative mx-auto w-full max-w-[560px]">
              <div className="text-center">
                <Image
                  src={siteConfig.logoPath}
                  alt="ALFFA Educação"
                  width={140}
                  height={140}
                  className="mx-auto h-24 w-24 rounded-full border border-[#2e7bf4] object-cover shadow-[0_0_0_4px_rgba(13,34,78,0.75)] sm:h-28 sm:w-28 lg:h-32 lg:w-32"
                />
                <h2 className="mt-8 text-4xl font-semibold leading-tight tracking-[-0.03em] text-white sm:text-[2.7rem]">
                  Bem-vindo de <span className="text-[#2d94ff]">volta!</span>
                </h2>
                <p className="mt-3 text-lg text-white/72">Faça login para acessar o painel administrativo</p>
              </div>

              <div className="mt-8 sm:mt-10">
                <LoginForm />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
