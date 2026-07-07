"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordSettingsForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("A confirmacao da senha nao confere.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        toast.error(payload.error ?? "Nao foi possivel atualizar a senha.");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Senha atualizada com sucesso.");
    } catch {
      toast.error("Falha de comunicacao ao atualizar a senha.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="currentPassword">Senha atual</Label>
        <Input id="currentPassword" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
      </div>
      <div>
        <Label htmlFor="newPassword">Nova senha</Label>
        <Input id="newPassword" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
        <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : "Atualizar senha"}
      </Button>
    </form>
  );
}
