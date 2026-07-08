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
    <form className="space-y-6" onSubmit={onSubmit} autoComplete="off">
      <div className="space-y-3">
        <Label htmlFor="email" className="text-[1.05rem] font-medium text-white/92">
          E-mail
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/72" strokeWidth={1.8} />
          <input
            id="email"
            type="email"
            autoComplete="off"
            placeholder="admin@alffaeducacao.com.br"
            className="h-14 w-full rounded-[18px] border border-white/5 bg-[linear-gradient(180deg,rgba(22,38,74,0.9),rgba(17,31,61,0.92))] pl-14 pr-4 text-lg text-white outline-none placeholder:text-white/52 focus:border-[#2d94ff] focus:ring-2 focus:ring-[#2d94ff]/25"
            {...form.register("email")}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="password" className="text-[1.05rem] font-medium text-white/92">
          Senha
        </Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/72" strokeWidth={1.8} />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Digite sua senha"
            className="h-14 w-full rounded-[18px] border border-white/5 bg-[linear-gradient(180deg,rgba(22,38,74,0.9),rgba(17,31,61,0.92))] pl-14 pr-14 text-lg text-white outline-none placeholder:text-white/52 focus:border-[#2d94ff] focus:ring-2 focus:ring-[#2d94ff]/25"
            {...form.register("password")}
          />
          <button
            type="button"
            aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
            className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-white/76 transition hover:bg-white/6 hover:text-white"
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? <EyeOff className="h-5 w-5" strokeWidth={1.8} /> : <Eye className="h-5 w-5" strokeWidth={1.8} />}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 text-base text-white/78 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            className="h-5 w-5 rounded border border-[#4e6ea8] bg-transparent text-[#2d94ff] accent-[#2d94ff]"
          />
          <span>Lembrar-me</span>
        </label>
        <button type="button" className="text-left font-medium text-[#2d94ff] transition hover:text-[#54abff] sm:text-right">
          Esqueceu sua senha?
        </button>
      </div>

      <Button
        className="h-14 w-full rounded-[18px] bg-[linear-gradient(90deg,#2b9dff_0%,#1f7dff_42%,#1e5bff_100%)] text-xl font-semibold text-white shadow-[0_14px_35px_rgba(28,112,255,0.35)] hover:opacity-100"
        type="submit"
        disabled={form.formState.isSubmitting}
      >
        Entrar no sistema
      </Button>

      <button
        type="button"
        className="flex h-14 w-full items-center justify-center gap-4 rounded-[18px] border border-white/14 bg-transparent px-4 text-xl font-medium text-white transition hover:bg-white/4"
      >
        <span className="text-[1.8rem] leading-none">G</span>
        <span>Entrar com Google</span>
      </button>

      <p className="pt-2 text-center text-sm text-white/56 sm:text-base">© 2025 Alffa Educa. Todos os direitos reservados.</p>
    </form>
  );
}
