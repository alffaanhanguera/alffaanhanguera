"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

type LoginSchema = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@alffaeducacao.com",
      password: "Admin@123"
    }
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
    <form className="space-y-5" onSubmit={onSubmit}>
      <div>
        <Label htmlFor="email" className="text-slate-600 dark:text-slate-300">
          E-mail
        </Label>
        <Input id="email" type="email" className="h-12" {...form.register("email")} />
      </div>
      <div>
        <Label htmlFor="password" className="text-slate-600 dark:text-slate-300">
          Senha
        </Label>
        <Input id="password" type="password" className="h-12" {...form.register("password")} />
      </div>
      <Button className="h-12 w-full text-base" type="submit" disabled={form.formState.isSubmitting}>
        Entrar no CRM
      </Button>
    </form>
  );
}
