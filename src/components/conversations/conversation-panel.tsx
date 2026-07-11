"use client";

import { useEffect, useMemo, useState } from "react";
import { ConversationComposer } from "@/components/conversations/conversation-composer";
import type { ConversationDetail } from "@/types/domain";
import { CONVERSATION_TAG_PRESETS, LEAD_PIPELINE_STAGES } from "@/lib/crm";
import { ChevronDown, FileText, FileTextIcon, Phone, Save, Tag, UserPlus, Video, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type MetaPanel = "tags" | "stage" | "notes" | null;

export function ConversationPanel({
  conversation,
  onRefresh
}: {
  conversation: ConversationDetail | null;
  onRefresh?: () => Promise<void> | void;
}) {
  const [draftTags, setDraftTags] = useState<string[]>([]);
  const [leadNotes, setLeadNotes] = useState("");
  const [customTag, setCustomTag] = useState("");
  const [pipelineStageId, setPipelineStageId] = useState("");
  const [isSavingMeta, setIsSavingMeta] = useState(false);
  const [openPanel, setOpenPanel] = useState<MetaPanel>(null);

  useEffect(() => {
    setDraftTags(conversation?.tags ?? []);
    setLeadNotes(conversation?.leadNotes ?? "");
    setPipelineStageId(conversation?.pipelineStageId ?? "");
    setCustomTag("");
    setOpenPanel(null);
  }, [conversation]);

  const currentStage = useMemo(
    () => LEAD_PIPELINE_STAGES.find((stage) => stage.id === pipelineStageId) ?? LEAD_PIPELINE_STAGES[0],
    [pipelineStageId]
  );

  if (!conversation) {
    return (
      <Card className="flex h-[calc(100vh-14rem)] items-center justify-center p-10 text-center md:h-[calc(100vh-15rem)] xl:h-[calc(100vh-13.5rem)]">
        <div>
          <p className="text-lg font-semibold text-slate-900">Nenhuma conversa selecionada</p>
          <p className="mt-2 text-sm text-slate-500">Assim que um lead interagir pelo WhatsApp, o histórico aparecerá aqui.</p>
        </div>
      </Card>
    );
  }

  const currentConversation = conversation;

  async function persistConversationMetadata(nextTags = draftTags, nextNotes = leadNotes, nextStageId = pipelineStageId) {
    try {
      setIsSavingMeta(true);
      const response = await fetch(`/api/conversations/${currentConversation.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tags: nextTags,
          leadNotes: nextNotes,
          pipelineStageId: nextStageId
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        toast.error(payload.error ?? "Nao foi possivel atualizar a conversa.");
        return;
      }

      toast.success("Conversa atualizada.");
      setOpenPanel(null);
      await onRefresh?.();
    } catch {
      toast.error("Falha de comunicacao ao atualizar a conversa.");
    } finally {
      setIsSavingMeta(false);
    }
  }

  async function handleToggleConversationControl() {
    try {
      const response = await fetch("/api/conversations/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          conversationId: currentConversation.id,
          aiEnabled: !currentConversation.aiEnabled
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        toast.error(payload.error ?? "Nao foi possivel atualizar a conversa.");
        return;
      }

      toast.success(currentConversation.aiEnabled ? "Conversa transferida para humano." : "Conversa devolvida ao chatbot.");
      await onRefresh?.();
    } catch {
      toast.error("Falha de comunicacao ao atualizar a conversa.");
    }
  }

  function addTag(tag: string) {
    const normalized = tag.trim();
    if (!normalized || draftTags.includes(normalized)) {
      return;
    }

    const nextTags = [...draftTags, normalized];
    setDraftTags(nextTags);
    void persistConversationMetadata(nextTags, leadNotes, pipelineStageId);
  }

  function removeTag(tag: string) {
    const nextTags = draftTags.filter((item) => item !== tag);
    setDraftTags(nextTags);
    void persistConversationMetadata(nextTags, leadNotes, pipelineStageId);
  }

  function renderMessageBody(message: ConversationDetail["messages"][number]) {
    if (message.type === "IMAGE") {
      return (
        <div className="space-y-2">
          <div className="rounded-2xl bg-black/10 px-3 py-2 text-xs font-medium uppercase tracking-wide">Imagem</div>
          <p>{message.text}</p>
        </div>
      );
    }

    if (message.type === "AUDIO") {
      return (
        <div className="space-y-2">
          <div className="rounded-2xl bg-black/10 px-3 py-2 text-xs font-medium uppercase tracking-wide">Áudio</div>
          <p>{message.text}</p>
        </div>
      );
    }

    if (message.type === "VIDEO") {
      return (
        <div className="space-y-2">
          <div className="rounded-2xl bg-black/10 px-3 py-2 text-xs font-medium uppercase tracking-wide">Vídeo</div>
          <p>{message.text}</p>
        </div>
      );
    }

    if (message.type === "DOCUMENT" || message.type === "PDF") {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-2xl bg-black/10 px-3 py-2 text-xs font-medium">
            <FileText className="h-4 w-4" />
            <span>{message.mediaName ?? message.text}</span>
          </div>
          {message.text !== message.mediaName ? <p>{message.text}</p> : null}
        </div>
      );
    }

    return <p>{message.text}</p>;
  }

  function togglePanel(panel: Exclude<MetaPanel, null>) {
    setOpenPanel((current) => (current === panel ? null : panel));
  }

  return (
    <Card className="flex h-[calc(100vh-14rem)] flex-col overflow-hidden p-0 md:h-[calc(100vh-15rem)] xl:h-[calc(100vh-13.5rem)]">
      <div className="relative flex flex-col gap-4 border-b px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Avatar fallback={conversation.leadName.slice(0, 2).toUpperCase()} />
            <div>
              <p className="font-semibold text-slate-900">{conversation.leadName}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className={`status-dot ${conversation.aiEnabled ? "bg-emerald-500" : "bg-orange-500"}`} />
                <p className="text-xs text-slate-500">{conversation.aiEnabled ? "Fluxo do chatbot ativo" : "Em fila humana"} · {conversation.phone}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="orange">{conversation.modality}</Badge>
            <Badge tone={conversation.aiEnabled ? "green" : "blue"}>{conversation.aiEnabled ? "Chatbot ativo" : `Operador: ${conversation.operator}`}</Badge>
            <Badge tone="sky">{conversation.status}</Badge>
            <Button variant="outline" size="sm" onClick={handleToggleConversationControl}>
              <UserPlus className="mr-2 h-4 w-4" />
              {conversation.aiEnabled ? "Transferir para humano" : "Devolver para o Chat"}
            </Button>
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" type="button" onClick={() => togglePanel("tags")}>
            <Tag className="mr-2 h-4 w-4" />
            Etiquetas
            {draftTags.length ? <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs">{draftTags.length}</span> : null}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" type="button" onClick={() => togglePanel("stage")}>
            Fila: {currentStage.label}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" type="button" onClick={() => togglePanel("notes")}>
            <FileTextIcon className="mr-2 h-4 w-4" />
            Notas
            {leadNotes.trim() ? <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs">1</span> : null}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>

          {draftTags.slice(0, 3).map((tag) => (
            <Badge key={tag} tone="blue">
              {tag}
            </Badge>
          ))}
          {draftTags.length > 3 ? <Badge tone="slate">+{draftTags.length - 3}</Badge> : null}
        </div>

        {openPanel ? (
          <div className="absolute left-4 right-4 top-full z-30 mt-2 rounded-[24px] border border-slate-200 bg-white p-4 shadow-xl sm:left-5 sm:right-5">
            {openPanel === "tags" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Etiquetas da conversa</p>
                    <p className="text-xs text-slate-500">Edite as tags sem ocupar a área principal do atendimento.</p>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setOpenPanel(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {draftTags.length ? (
                    draftTags.map((tag) => (
                      <Badge key={tag} tone="blue" className="gap-2">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">Nenhuma etiqueta aplicada.</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {CONVERSATION_TAG_PRESETS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:border-blue-200 hover:text-blue-700"
                      onClick={() => addTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    className="flex h-10 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none"
                    placeholder="Criar etiqueta personalizada..."
                    value={customTag}
                    onChange={(event) => setCustomTag(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        const normalized = customTag.trim();
                        if (!normalized) {
                          return;
                        }
                        addTag(normalized);
                        setCustomTag("");
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const normalized = customTag.trim();
                      if (!normalized) {
                        return;
                      }
                      addTag(normalized);
                      setCustomTag("");
                    }}
                  >
                    Adicionar
                  </Button>
                </div>
              </div>
            ) : null}

            {openPanel === "stage" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Fila do lead</p>
                    <p className="text-xs text-slate-500">Atualize o estágio sem tomar espaço do painel principal.</p>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setOpenPanel(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <select
                  className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none"
                  value={pipelineStageId}
                  onChange={(event) => setPipelineStageId(event.target.value)}
                >
                  {LEAD_PIPELINE_STAGES.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.label}
                    </option>
                  ))}
                </select>

                <div className="flex justify-end">
                  <Button type="button" onClick={() => void persistConversationMetadata()}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSavingMeta ? "Salvando..." : "Salvar fila"}
                  </Button>
                </div>
              </div>
            ) : null}

            {openPanel === "notes" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Notas do lead</p>
                    <p className="text-xs text-slate-500">Observações internas em um pop-up dedicado.</p>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setOpenPanel(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <Textarea
                  className="min-h-[160px] rounded-[24px]"
                  placeholder="Escreva observações internas sobre este lead..."
                  value={leadNotes}
                  onChange={(event) => setLeadNotes(event.target.value)}
                />

                <div className="flex justify-end">
                  <Button type="button" onClick={() => void persistConversationMetadata()}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSavingMeta ? "Salvando..." : "Salvar notas"}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <ScrollArea className="min-h-0 flex-1 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(228,236,246,0.9))] px-4 py-5 sm:px-5 sm:py-6">
        <div className="space-y-4">
          {conversation.messages.map((message) => (
            <div key={message.id} className={`flex ${message.inbound ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[92%] rounded-[24px] px-4 py-3 text-sm shadow-sm sm:max-w-[80%] ${
                  message.inbound ? "bg-white text-slate-900" : "bg-blue-900 text-white"
                }`}
              >
                {renderMessageBody(message)}
                <div className={`mt-2 flex items-center justify-between gap-3 text-[11px] ${message.inbound ? "text-slate-400" : "text-blue-100"}`}>
                  <span>{message.time}</span>
                  {!message.inbound && message.deliveryLabel ? <span>{message.deliveryLabel}</span> : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t bg-white px-4 py-4 sm:px-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge tone="blue">{conversation.status}</Badge>
          <Badge tone="slate">Turno: {conversation.shift}</Badge>
          <Badge tone="slate">{conversation.benefitSummary}</Badge>
          {conversation.aiSummary ? <Badge tone="orange">Resumo pronto para operador</Badge> : null}
        </div>

        <ConversationComposer conversationId={conversation.id} onSent={onRefresh} assistantEnabled={conversation.aiEnabled} />
      </div>
    </Card>
  );
}
