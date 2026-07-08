"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type FaqData = {
  faqItems: Array<{ id: string; category: string; question: string; answer: string; priority: number }>;
  knowledgeDocuments: Array<{ id: string; category: string; title: string; content: string }>;
};

export function FAQManager({ initialData }: { initialData: FaqData }) {
  const [data, setData] = useState(initialData);
  const [faqDraft, setFaqDraft] = useState({ id: "", category: "", question: "", answer: "", priority: 0 });
  const [docDraft, setDocDraft] = useState({ id: "", category: "", title: "", content: "" });

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  async function refreshFaq() {
    const response = await fetch("/api/faq", { cache: "no-store" });
    const payload = await response.json();
    setData(payload.data);
  }

  async function saveFaq() {
    const response = await fetch("/api/faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "faq", ...faqDraft })
    });
    const payload = await response.json();
    if (!response.ok) {
      toast.error(payload.error ?? "Nao foi possivel salvar a regra.");
      return;
    }
    toast.success("Regra salva com sucesso.");
    setFaqDraft({ id: "", category: "", question: "", answer: "", priority: 0 });
    setData(payload.data);
  }

  async function saveDocument() {
    const response = await fetch("/api/faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "document", ...docDraft })
    });
    const payload = await response.json();
    if (!response.ok) {
      toast.error(payload.error ?? "Nao foi possivel salvar o conhecimento.");
      return;
    }
    toast.success("Base complementar salva com sucesso.");
    setDocDraft({ id: "", category: "", title: "", content: "" });
    setData(payload.data);
  }

  async function removeItem(type: "faq" | "document", id: string) {
    const response = await fetch(`/api/faq?id=${id}&type=${type}`, {
      method: "DELETE"
    });
    const payload = await response.json();
    if (!response.ok) {
      toast.error(payload.error ?? "Nao foi possivel excluir o item.");
      return;
    }
    toast.success("Item removido com sucesso.");
    await refreshFaq();
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Regras e respostas para o Chatbot Juliana</h2>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Tudo o que a Juliana precisa consultar antes de responder o aluno.</p>
          </div>
          <button type="button" className="rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white" onClick={() => setFaqDraft({ id: "", category: "", question: "", answer: "", priority: 0 })}>
            <Plus className="mr-2 inline h-4 w-4" />
            Nova regra
          </button>
        </div>

        <div className="mt-6 space-y-3 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
          <Input placeholder="Categoria" value={faqDraft.category} onChange={(event) => setFaqDraft((current) => ({ ...current, category: event.target.value }))} />
          <Input placeholder="Pergunta" value={faqDraft.question} onChange={(event) => setFaqDraft((current) => ({ ...current, question: event.target.value }))} />
          <Textarea className="min-h-[120px]" placeholder="Resposta da base de conhecimento" value={faqDraft.answer} onChange={(event) => setFaqDraft((current) => ({ ...current, answer: event.target.value }))} />
          <Input placeholder="Prioridade" type="number" value={faqDraft.priority} onChange={(event) => setFaqDraft((current) => ({ ...current, priority: Number(event.target.value) }))} />
          <div className="flex justify-end">
            <button type="button" className="rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white" onClick={() => void saveFaq()}>
              Salvar regra
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {data.faqItems.map((item) => (
            <div key={item.id} className="rounded-[24px] border border-[hsl(var(--border))] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">{item.category}</p>
                  <p className="mt-2 font-semibold">{item.question}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" className="text-slate-500" onClick={() => setFaqDraft(item)}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" className="text-red-500" onClick={() => void removeItem("faq", item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{item.answer}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Base de conhecimento complementar</h2>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Documentos internos e instrucoes extras que a IA deve consultar sempre.</p>
          </div>
          <button type="button" className="rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white" onClick={() => setDocDraft({ id: "", category: "", title: "", content: "" })}>
            <Plus className="mr-2 inline h-4 w-4" />
            Novo conhecimento
          </button>
        </div>

        <div className="mt-6 space-y-3 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
          <Input placeholder="Categoria" value={docDraft.category} onChange={(event) => setDocDraft((current) => ({ ...current, category: event.target.value }))} />
          <Input placeholder="Titulo" value={docDraft.title} onChange={(event) => setDocDraft((current) => ({ ...current, title: event.target.value }))} />
          <Textarea className="min-h-[160px]" placeholder="Conteudo que a IA deve consultar" value={docDraft.content} onChange={(event) => setDocDraft((current) => ({ ...current, content: event.target.value }))} />
          <div className="flex justify-end">
            <button type="button" className="rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white" onClick={() => void saveDocument()}>
              Salvar base complementar
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {data.knowledgeDocuments.map((document) => (
            <div key={document.id} className="rounded-[24px] border border-[hsl(var(--border))] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">{document.category}</p>
                  <p className="mt-2 font-semibold">{document.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" className="text-slate-500" onClick={() => setDocDraft(document)}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" className="text-red-500" onClick={() => void removeItem("document", document.id)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{document.content}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
