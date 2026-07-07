"use client";

import { startTransition, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Paperclip, SendHorizontal, Smile, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ConversationComposer({
  conversationId,
  onSent
}: {
  conversationId: string;
  onSent?: () => Promise<void> | void;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if ((!content.trim() && !selectedFile) || isSending) {
      return;
    }

    setIsSending(true);

    try {
      const response = selectedFile
        ? await sendMediaMessage()
        : await fetch("/api/conversations", {
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
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast.success("Mensagem enviada com sucesso.");
      await onSent?.();
      startTransition(() => {
        router.refresh();
      });
    } catch {
      toast.error("Falha de comunicacao ao enviar a mensagem.");
    } finally {
      setIsSending(false);
    }
  }

  async function sendMediaMessage() {
    const formData = new FormData();
    formData.append("conversationId", conversationId);
    formData.append("caption", content);

    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    return fetch("/api/conversations/media", {
      method: "POST",
      body: formData
    });
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      {selectedFile ? (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/70">
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">{selectedFile.name}</p>
            <p className="text-slate-500 dark:text-slate-400">{Math.ceil(selectedFile.size / 1024)} KB</p>
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
            onClick={() => {
              setSelectedFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          setSelectedFile(file);
        }}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" type="button">
            <Smile className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" type="button" onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" type="button" onClick={() => fileInputRef.current?.click()}>
            <Mic className="h-4 w-4" />
          </Button>
        </div>
        <Textarea
          className="min-h-[52px] flex-1 resize-none rounded-[24px]"
          placeholder={selectedFile ? "Digite uma legenda opcional..." : "Responder, enviar audio, anexos ou assumir a conversa..."}
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        <Button
          variant="secondary"
          type="submit"
          className="w-full sm:w-auto"
          disabled={isSending || (!content.trim() && !selectedFile)}
        >
          <SendHorizontal className="mr-2 h-4 w-4" />
          {isSending ? "Enviando" : "Enviar"}
        </Button>
      </div>
    </form>
  );
}
