"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

type LoginSchema = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    const payload = await response.json();

    if (!response.ok) {
      toast.error(payload.error ?? "Falha ao autenticar.");
      return;
    }

    toast.success("Acesso liberado.");
    router.push("/dashboard");
    router.refresh();
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit} autoComplete="off">
      <div className="space-y-2.5">
        <Label htmlFor="email" className="text-base font-medium text-white/92">
          E-mail
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-white/72" strokeWidth={1.8} />
          <input
            id="email"
            type="email"
            autoComplete="off"
            placeholder="admin@alffaeducacao.com.br"
            className="h-12 w-full rounded-[16px] border border-white/5 bg-[linear-gradient(180deg,rgba(22,38,74,0.9),rgba(17,31,61,0.92))] pl-12 pr-4 text-base text-white outline-none placeholder:text-white/52 focus:border-[#2d94ff] focus:ring-2 focus:ring-[#2d94ff]/25"
            {...form.register("email")}
          />
        </div>
      </div>

      <div className="space-y-2.5">
        <Label htmlFor="password" className="text-base font-medium text-white/92">
          Senha
        </Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-white/72" strokeWidth={1.8} />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Digite sua senha"
            className="h-12 w-full rounded-[16px] border border-white/5 bg-[linear-gradient(180deg,rgba(22,38,74,0.9),rgba(17,31,61,0.92))] pl-12 pr-12 text-base text-white outline-none placeholder:text-white/52 focus:border-[#2d94ff] focus:ring-2 focus:ring-[#2d94ff]/25"
            {...form.register("password")}
          />
          <button
            type="button"
            aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-white/82 transition hover:bg-white/6 hover:text-white"
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? <EyeOff className="h-4.5 w-4.5" strokeWidth={1.8} /> : <Eye className="h-4.5 w-4.5" strokeWidth={1.8} />}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 text-sm text-white/90 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2.5 text-white/88">
          <input
            type="checkbox"
            className="mt-0.5 h-[18px] w-[18px] rounded border border-[#6f8fca] bg-transparent accent-[#2d94ff]"
          />
          <span className="leading-none">Lembrar-me</span>
        </label>
        <button type="button" className="text-left font-medium text-[#2d94ff] transition hover:text-[#54abff] sm:text-right">
          Esqueceu sua senha?
        </button>
      </div>

      <Button
        className="h-12 w-full rounded-[16px] bg-[linear-gradient(90deg,#2b9dff_0%,#1f7dff_42%,#1e5bff_100%)] text-lg font-semibold text-white shadow-[0_14px_35px_rgba(28,112,255,0.35)] hover:opacity-100"
        type="submit"
        disabled={form.formState.isSubmitting}
      >
        Entrar no sistema
      </Button>

      <p className="pt-1 text-center text-sm text-white/60">© 2025 Alffa Educa. Todos os direitos reservados.</p>
    </form>
  );
}
