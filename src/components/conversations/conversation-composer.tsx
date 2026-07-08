"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Mic, Paperclip, SendHorizontal, Smile, Square, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ConversationComposer({
  conversationId,
  onSent,
  assistantEnabled
}: {
  conversationId: string;
  onSent?: () => Promise<void> | void;
  assistantEnabled: boolean;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPreparingRecorder, setIsPreparingRecorder] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl);
      }

      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [audioPreviewUrl]);

  function clearSelectedMedia() {
    setSelectedFile(null);

    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl);
      setAudioPreviewUrl(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function getAudioMimeType() {
    if (typeof MediaRecorder === "undefined") {
      return "";
    }

    if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
      return "audio/webm;codecs=opus";
    }

    if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
      return "audio/ogg;codecs=opus";
    }

    if (MediaRecorder.isTypeSupported("audio/mp4")) {
      return "audio/mp4";
    }

    return "";
  }

  async function startAudioRecording() {
    if (isPreparingRecorder || isRecording || isSending) {
      return;
    }

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      toast.error("Gravação de áudio não suportada neste navegador.");
      return;
    }

    setIsPreparingRecorder(true);

    try {
      clearSelectedMedia();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getAudioMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      });

      recorder.addEventListener("stop", () => {
        const finalMimeType = recorder.mimeType || "audio/webm";
        const extension = finalMimeType.includes("ogg") ? "ogg" : finalMimeType.includes("mp4") ? "m4a" : "webm";
        const blob = new Blob(audioChunksRef.current, { type: finalMimeType });
        const file = new File([blob], `audio-${Date.now()}.${extension}`, { type: finalMimeType });
        const previewUrl = URL.createObjectURL(blob);

        setSelectedFile(file);
        setAudioPreviewUrl(previewUrl);
        setIsRecording(false);
        audioChunksRef.current = [];
        stream.getTracks().forEach((track) => track.stop());
      });

      recorder.start();
      setIsRecording(true);
    } catch {
      toast.error("Não foi possível acessar o microfone.");
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
      mediaRecorderRef.current = null;
    } finally {
      setIsPreparingRecorder(false);
    }
  }

  function stopAudioRecording() {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
      return;
    }

    mediaRecorderRef.current.stop();
    mediaRecorderRef.current = null;
  }

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
      clearSelectedMedia();
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
          <div className="min-w-0 flex-1">
            <p className="font-medium text-slate-900 dark:text-slate-100">{selectedFile.name}</p>
            <p className="text-slate-500 dark:text-slate-400">{Math.ceil(selectedFile.size / 1024)} KB</p>
            {audioPreviewUrl && selectedFile.type.startsWith("audio/") ? (
              <audio className="mt-3 w-full" controls src={audioPreviewUrl}>
                Seu navegador não suporta áudio embutido.
              </audio>
            ) : null}
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
            onClick={clearSelectedMedia}
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
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={isRecording ? stopAudioRecording : startAudioRecording}
            disabled={isPreparingRecorder || isSending}
            className={isRecording ? "bg-red-50 text-red-600 hover:bg-red-100" : ""}
          >
            {isPreparingRecorder ? <LoaderCircle className="h-4 w-4 animate-spin" /> : isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        </div>
        <Textarea
          className="min-h-[52px] flex-1 resize-none rounded-[24px]"
          placeholder={
            isRecording
              ? "Gravando áudio... clique no botão vermelho para parar."
              : selectedFile
                ? "Digite uma legenda opcional..."
                : "Responder, enviar audio, anexos ou assumir a conversa..."
          }
          value={content}
          onChange={(event) => setContent(event.target.value)}
          disabled={isRecording}
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
      <p className="text-xs text-slate-500">
        {assistantEnabled
          ? "Chatbot Juliana ativo. Use o botao de transferencia quando quiser assumir manualmente."
          : "Atendimento humano ativo. Enquanto isso, chatbot e IA permanecem silenciosos."}
      </p>
    </form>
  );
}
