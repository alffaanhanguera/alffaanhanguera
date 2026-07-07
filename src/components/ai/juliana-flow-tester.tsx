"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type SimulatedMessage = {
  id: string;
  content: string;
  direction: "INBOUND" | "OUTBOUND";
  createdAt: string;
};

type SimulationResponse = {
  conversation: {
    id: string;
    leadName: string;
    phone: string;
    aiEnabled: boolean;
    status: string;
    messages: SimulatedMessage[];
  } | null;
};

export function JulianaFlowTester() {
  const [phone, setPhone] = useState("5511999999999");
  const [text, setText] = useState("");
  const [history, setHistory] = useState<SimulatedMessage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function runSimulation(payload: { reset?: boolean; text?: string }) {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/ai/simulate-flow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phone,
          ...payload
        })
      });

      const data = (await response.json()) as { error?: string } & SimulationResponse;

      if (!response.ok) {
        toast.error(data.error ?? "Nao foi possivel simular o fluxo.");
        return;
      }

      setHistory(data.conversation?.messages ?? []);

      if (payload.reset) {
        toast.success("Conversa de teste reiniciada.");
        setText("");
        return;
      }

      setText("");
      toast.success("Mensagem simulada com sucesso.");
    } catch {
      toast.error("Falha de comunicacao ao simular o fluxo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[minmax(0,240px)_1fr_auto_auto]">
        <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="5511999999999" />
        <Textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Digite a mensagem do lead para testar a Juliana"
          className="min-h-[44px] md:min-h-[44px]"
        />
        <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => runSimulation({ reset: true })}>
          Reiniciar
        </Button>
        <Button type="button" disabled={isSubmitting || !text.trim()} onClick={() => runSimulation({ text })}>
          Simular
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Use qualquer telefone ficticio para testar. O simulador percorre o mesmo fluxo da Juliana e grava a conversa no banco.
        </p>

        <div className="mt-4 space-y-3">
          {history.length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Nenhuma mensagem simulada ainda.</p>
          ) : (
            history.map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  message.direction === "OUTBOUND"
                    ? "ml-auto bg-sky-600 text-white"
                    : "bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100"
                }`}
              >
                <p>{message.content}</p>
                <p className={`mt-2 text-[11px] ${message.direction === "OUTBOUND" ? "text-sky-100" : "text-slate-500"}`}>
                  {new Intl.DateTimeFormat("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                  }).format(new Date(message.createdAt))}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
