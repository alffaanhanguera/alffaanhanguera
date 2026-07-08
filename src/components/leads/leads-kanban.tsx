"use client";

import { useEffect, useMemo, useState } from "react";
import { GripVertical, Pencil, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { LeadBoardItem } from "@/types/domain";

type LeadCard = LeadBoardItem;

type KanbanColumn = {
  id: string;
  title: string;
  description: string;
  accent: string;
  leads: LeadCard[];
};

type Props = {
  initialColumns: KanbanColumn[];
  initialLeads: LeadBoardItem[];
};

const statusMap: Record<string, string> = {
  new: "Novo",
  qualifying: "Qualificando",
  ready: "Pronto para operador",
  negotiation: "Negociacao"
};

const emptyLead = {
  id: "",
  name: "",
  phone: "",
  course: "",
  modality: "",
  city: "",
  region: "",
  cpf: "",
  email: "",
  birthDate: "",
  companyName: "",
  status: "Novo",
  benefitSummary: ""
};

export function LeadsKanban({ initialColumns, initialLeads }: Props) {
  const [columns, setColumns] = useState(initialColumns);
  const [leads, setLeads] = useState(initialLeads);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [editingLead, setEditingLead] = useState<LeadBoardItem | null>(null);
  const [draftLead, setDraftLead] = useState<LeadBoardItem>(emptyLead);

  useEffect(() => {
    setColumns(initialColumns);
    setLeads(initialLeads);
  }, [initialColumns, initialLeads]);

  useEffect(() => {
    const interval = window.setInterval(async () => {
      try {
        const response = await fetch("/api/leads", { cache: "no-store" });
        if (!response.ok) {
          return;
        }
        const payload = await response.json();
        setColumns(payload.data.columns);
        setLeads(payload.data.leads);
      } catch {
        // silent sync
      }
    }, 3000);

    return () => window.clearInterval(interval);
  }, []);

  const filteredLeads = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return leads;
    }

    return leads.filter((lead) =>
      [lead.name, lead.phone, lead.course, lead.city, lead.status, lead.benefitSummary].join(" ").toLowerCase().includes(term)
    );
  }, [leads, search]);

  const filteredColumns = useMemo(
    () =>
      columns.map((column) => ({
        ...column,
        leads: filteredLeads.filter((lead) => lead.status === statusMap[column.id])
      })),
    [columns, filteredLeads]
  );

  function startEdit(lead: LeadBoardItem) {
    setEditingLead(lead);
    setDraftLead(lead);
  }

  async function refreshLeads() {
    const response = await fetch("/api/leads", { cache: "no-store" });
    const payload = await response.json();
    setColumns(payload.data.columns);
    setLeads(payload.data.leads);
  }

  async function saveLead() {
    try {
      const response = await fetch(`/api/leads/${draftLead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draftLead)
      });
      const payload = await response.json();
      if (!response.ok) {
        toast.error(payload.error ?? "Nao foi possivel salvar o lead.");
        return;
      }
      toast.success("Lead atualizado com sucesso.");
      setEditingLead(null);
      await refreshLeads();
    } catch {
      toast.error("Falha de comunicacao ao salvar o lead.");
    }
  }

  async function deleteLead(id: string) {
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: "DELETE"
      });
      const payload = await response.json();
      if (!response.ok) {
        toast.error(payload.error ?? "Nao foi possivel excluir o lead.");
        return;
      }
      toast.success("Lead excluido com sucesso.");
      await refreshLeads();
    } catch {
      toast.error("Falha de comunicacao ao excluir o lead.");
    }
  }

  async function moveLead(leadId: string, columnId: string) {
    try {
      const response = await fetch(`/api/leads/${leadId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnId })
      });
      const payload = await response.json();
      if (!response.ok) {
        toast.error(payload.error ?? "Nao foi possivel mover o lead.");
        return;
      }
      setColumns(payload.data.columns);
      setLeads(payload.data.leads);
    } catch {
      toast.error("Falha de comunicacao ao mover o lead.");
    }
  }

  return (
    <div className="space-y-4">
      <Card className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-xl flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input className="pl-10" placeholder="Pesquisar leads, cursos, telefone ou cidade..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1">
          <button
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-medium ${viewMode === "kanban" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
            onClick={() => setViewMode("kanban")}
          >
            Kanban
          </button>
          <button
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-medium ${viewMode === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
            onClick={() => setViewMode("list")}
          >
            Lista
          </button>
        </div>
      </Card>

      {viewMode === "kanban" ? (
        <div className="grid gap-4 xl:grid-cols-4">
          {filteredColumns.map((column, columnIndex) => (
            <Card
              key={column.id}
              className="p-0"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                const leadId = event.dataTransfer.getData("text/plain");
                if (leadId) {
                  void moveLead(leadId, column.id);
                }
              }}
            >
              <div className="border-b px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <input
                      value={column.title}
                      onChange={(event) => {
                        const nextColumns = [...filteredColumns];
                        nextColumns[columnIndex] = { ...column, title: event.target.value };
                        setColumns(nextColumns);
                      }}
                      className="w-full bg-transparent text-lg font-semibold outline-none"
                    />
                    <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{column.description}</p>
                  </div>
                  <span className={`h-3 w-3 rounded-full ${column.accent}`} />
                </div>
              </div>

              <div className="space-y-3 p-4">
                {column.leads.length ? (
                  column.leads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(event) => event.dataTransfer.setData("text/plain", lead.id)}
                      className="rounded-[24px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <GripVertical className="mt-1 h-4 w-4 text-slate-400" />
                          <div>
                            <p className="font-semibold">{lead.name}</p>
                            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{lead.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" className="text-slate-500 hover:text-slate-900" onClick={() => startEdit(lead)}>
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button type="button" className="text-red-500" onClick={() => void deleteLead(lead.id)}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2 text-sm">
                        <p><span className="font-medium">Curso:</span> {lead.course}</p>
                        <p><span className="font-medium">Modalidade:</span> {lead.modality}</p>
                        <p><span className="font-medium">Cidade:</span> {lead.city}</p>
                        <p><span className="font-medium">Beneficio:</span> {lead.benefitSummary}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-[hsl(var(--border))] p-5 text-sm text-[hsl(var(--muted-foreground))]">
                    Nenhum lead nesta etapa no momento.
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Nome</th>
                  <th className="px-5 py-3 font-medium">Telefone</th>
                  <th className="px-5 py-3 font-medium">Curso</th>
                  <th className="px-5 py-3 font-medium">Cidade</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-t">
                    <td className="px-5 py-4 font-medium text-slate-900">{lead.name}</td>
                    <td className="px-5 py-4 text-slate-600">{lead.phone}</td>
                    <td className="px-5 py-4 text-slate-600">{lead.course}</td>
                    <td className="px-5 py-4 text-slate-600">{lead.city}</td>
                    <td className="px-5 py-4 text-slate-600">{lead.status}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button type="button" className="text-slate-600 hover:text-slate-900" onClick={() => startEdit(lead)}>
                          Editar
                        </button>
                        <button type="button" className="text-red-500" onClick={() => void deleteLead(lead.id)}>
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {editingLead ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6">
          <div className="w-full max-w-4xl rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Editar lead</h2>
                <p className="mt-1 text-sm text-slate-500">Ajuste todos os dados coletados no fluxo do WhatsApp.</p>
              </div>
              <button type="button" className="text-slate-500" onClick={() => setEditingLead(null)}>
                Fechar
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                ["name", "Nome completo"],
                ["phone", "Telefone"],
                ["course", "Curso"],
                ["modality", "Modalidade"],
                ["city", "Cidade"],
                ["region", "Regiao"],
                ["cpf", "CPF"],
                ["email", "E-mail"],
                ["birthDate", "Nascimento (dd/mm/aaaa)"],
                ["companyName", "Empresa"],
                ["benefitSummary", "Beneficio"],
                ["status", "Status"]
              ].map(([key, label]) => (
                <div key={key}>
                  <p className="mb-2 text-sm font-medium text-slate-700">{label}</p>
                  <Input
                    value={draftLead[key as keyof LeadBoardItem] as string}
                    onChange={(event) => setDraftLead((current) => ({ ...current, [key]: event.target.value }))}
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600" onClick={() => setEditingLead(null)}>
                Cancelar
              </button>
              <button type="button" className="rounded-full bg-blue-700 px-5 py-2 text-sm font-semibold text-white" onClick={() => void saveLead()}>
                Salvar alteracoes
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
