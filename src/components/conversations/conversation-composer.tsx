"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, SendHorizontal, Smile } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ConversationComposer({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!content.trim() || isSending) {
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          conversationId,
          content
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        toast.error(payload.error ?? "Nao foi possivel enviar a mensagem.");
        return;
      }

      setContent("");
      toast.success("Mensagem enviada com sucesso.");
      startTransition(() => {
        router.refresh();
      });
    } catch {
      toast.error("Falha de comunicacao ao enviar a mensagem.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form className="flex items-end gap-2" onSubmit={handleSubmit}>
      <Button variant="ghost" size="sm" type="button">
        <Smile className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" type="button">
        <Paperclip className="h-4 w-4" />
      </Button>
      <Textarea
        className="min-h-[52px] resize-none rounded-[24px]"
        placeholder="Responder, enviar audio, anexos ou assumir a conversa..."
        value={content}
        onChange={(event) => setContent(event.target.value)}
      />
      <Button variant="secondary" type="submit" disabled={isSending || !content.trim()}>
        <SendHorizontal className="mr-2 h-4 w-4" />
        {isSending ? "Enviando" : "Enviar"}
      </Button>
    </form>
  );
}
