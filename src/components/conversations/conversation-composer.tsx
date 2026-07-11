"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Mic, Paperclip, SendHorizontal, Smile, Square, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const QUICK_REPLY_STORAGE_KEY = "alffa-quick-replies";
const EMOJIS = ["😀", "😁", "😊", "😉", "🙏", "👍", "🎓", "📚", "💬", "✅", "⏰", "📎"];

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
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPreparingRecorder, setIsPreparingRecorder] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(QUICK_REPLY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setQuickReplies(parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0));
        }
      }
    } catch {
      // ignore bad local storage payloads
    }
  }, []);

  useEffect(() => {
    return () => {
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl);
      }

      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }

      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [audioPreviewUrl, filePreviewUrl]);

  function persistQuickReplies(nextReplies: string[]) {
    setQuickReplies(nextReplies);
    window.localStorage.setItem(QUICK_REPLY_STORAGE_KEY, JSON.stringify(nextReplies));
  }

  function clearSelectedMedia() {
    setSelectedFile(null);

    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl);
      setAudioPreviewUrl(null);
    }

    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
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
        setFilePreviewUrl(null);
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

  function insertEmoji(emoji: string) {
    setContent((current) => `${current}${emoji}`);
    textareaRef.current?.focus();
    setShowEmojiPicker(false);
  }

  function saveCurrentAsQuickReply() {
    const trimmed = content.trim();

    if (!trimmed) {
      toast.error("Digite uma mensagem para salvar como rápida.");
      return;
    }

    if (quickReplies.includes(trimmed)) {
      toast.error("Essa mensagem rápida já existe.");
      return;
    }

    persistQuickReplies([trimmed, ...quickReplies].slice(0, 20));
    toast.success("Mensagem rápida salva.");
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
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-900">{selectedFile.name}</p>
              <p className="text-slate-500">{Math.ceil(selectedFile.size / 1024)} KB</p>
            </div>
            <button type="button" className="rounded-full p-2 text-slate-500 hover:bg-slate-200" onClick={clearSelectedMedia}>
              <X className="h-4 w-4" />
            </button>
          </div>

          {audioPreviewUrl && selectedFile.type.startsWith("audio/") ? (
            <audio className="mt-3 w-full" controls src={audioPreviewUrl}>
              Seu navegador não suporta áudio embutido.
            </audio>
          ) : null}

          {filePreviewUrl && selectedFile.type.startsWith("image/") ? (
            <img src={filePreviewUrl} alt={selectedFile.name} className="mt-3 max-h-48 rounded-2xl object-cover" />
          ) : null}
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

          if (audioPreviewUrl) {
            URL.revokeObjectURL(audioPreviewUrl);
            setAudioPreviewUrl(null);
          }

          if (filePreviewUrl) {
            URL.revokeObjectURL(filePreviewUrl);
            setFilePreviewUrl(null);
          }

          if (file?.type.startsWith("image/")) {
            setFilePreviewUrl(URL.createObjectURL(file));
          }
        }}
      />

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>{assistantEnabled ? "Chatbot ativo nesta conversa." : "Operador em atendimento."}</span>
        <span>Enter envia. Shift + Enter quebra linha.</span>
      </div>

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" type="button" onClick={() => setShowEmojiPicker((current) => !current)}>
            <Smile className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" type="button" onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" type="button" onClick={() => setShowQuickReplies((current) => !current)}>
            Rápidas
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
          ref={textareaRef}
          className="min-h-[52px] flex-1 resize-none rounded-[24px]"
          placeholder={
            isRecording
              ? "Gravando áudio... clique no botão vermelho para parar."
              : selectedFile
                ? "Digite uma legenda opcional..."
                : "Responder, enviar áudio, anexos ou assumir a conversa..."
          }
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <Button type="submit" disabled={isSending || isRecording || isPreparingRecorder}>
          <SendHorizontal className="mr-2 h-4 w-4" />
          {isSending ? "Enviando..." : "Enviar"}
        </Button>

        {showEmojiPicker ? (
          <div className="absolute bottom-full left-0 z-20 mb-2 flex max-w-xs flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
            {EMOJIS.map((emoji) => (
              <button key={emoji} type="button" className="rounded-xl px-2 py-1 text-lg hover:bg-slate-100" onClick={() => insertEmoji(emoji)}>
                {emoji}
              </button>
            ))}
          </div>
        ) : null}

        {showQuickReplies ? (
          <div className="absolute bottom-full left-16 z-20 mb-2 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">Mensagens rápidas</p>
              <Button variant="ghost" size="sm" type="button" onClick={saveCurrentAsQuickReply}>
                Salvar atual
              </Button>
            </div>

            <div className="max-h-56 space-y-2 overflow-y-auto">
              {quickReplies.length ? (
                quickReplies.map((reply) => (
                  <div key={reply} className="flex items-start gap-2 rounded-2xl border border-slate-200 p-2">
                    <button
                      type="button"
                      className="flex-1 text-left text-sm text-slate-700"
                      onClick={() => {
                        setContent(reply);
                        setShowQuickReplies(false);
                      }}
                    >
                      {reply}
                    </button>
                    <button
                      type="button"
                      className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      onClick={() => persistQuickReplies(quickReplies.filter((item) => item !== reply))}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Nenhuma mensagem rápida salva ainda.</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </form>
  );
}
