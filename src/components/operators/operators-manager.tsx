"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type OperatorPanelData = {
  summary: {
    total: number;
    admins: number;
    supervisors: number;
    operators: number;
  };
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    conversations: number;
    permissions: string[];
  }>;
};

const emptyDraft = {
  id: "",
  name: "",
  email: "",
  role: "Operador",
  status: "Ativo",
  password: ""
};

export function OperatorsManager({ initialData }: { initialData: OperatorPanelData }) {
  const [data, setData] = useState(initialData);
  const [draft, setDraft] = useState(emptyDraft);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  async function saveOperator() {
    const response = await fetch("/api/operators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft)
    });
    const payload = await response.json();
    if (!response.ok) {
      toast.error(payload.error ?? "Nao foi possivel salvar o usuario.");
      return;
    }
    toast.success("Usuario salvo com sucesso.");
    setData(payload.data);
    setDraft(emptyDraft);
    setIsOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Total de acessos</p>
          <p className="mt-3 text-3xl font-semibold">{data.summary.total}</p>
        </Card>
        <Card>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Admins</p>
          <p className="mt-3 text-3xl font-semibold">{data.summary.admins}</p>
        </Card>
        <Card>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Supervisores</p>
          <p className="mt-3 text-3xl font-semibold">{data.summary.supervisors}</p>
        </Card>
        <Card>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Operadores</p>
          <p className="mt-3 text-3xl font-semibold">{data.summary.operators}</p>
        </Card>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-4 border-b px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Squad operacional</h2>
            <p className="mt-1 text-sm text-slate-500">Equipe com perfis de acesso, fila de conversas e permissões do CRM.</p>
          </div>
          <button type="button" className="rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white" onClick={() => { setDraft(emptyDraft); setIsOpen(true); }}>
            <Plus className="mr-2 inline h-4 w-4" />
            Novo usuario
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Nome</th>
                <th className="px-6 py-3 font-medium">E-mail</th>
                <th className="px-6 py-3 font-medium">Perfil</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Conversas</th>
                <th className="px-6 py-3 font-medium">Permissões</th>
                <th className="px-6 py-3 font-medium">Editar</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="px-6 py-4 text-slate-900">{user.name}</td>
                  <td className="px-6 py-4 text-slate-600">{user.email}</td>
                  <td className="px-6 py-4 text-slate-600">{user.role}</td>
                  <td className="px-6 py-4 text-slate-600">{user.status}</td>
                  <td className="px-6 py-4 text-slate-600">{user.conversations}</td>
                  <td className="px-6 py-4 text-slate-600">{user.permissions.join(", ")}</td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 text-slate-700"
                      onClick={() => {
                        setDraft({
                          id: user.id,
                          name: user.name,
                          email: user.email,
                          role: user.role,
                          status: user.status,
                          password: ""
                        });
                        setIsOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{draft.id ? "Editar usuario" : "Novo usuario"}</h2>
                <p className="mt-1 text-sm text-slate-500">Cadastre administradores, supervisores e operadores.</p>
              </div>
              <button type="button" className="text-slate-500" onClick={() => setIsOpen(false)}>
                Fechar
              </button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Input placeholder="Nome" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
              <Input placeholder="E-mail" value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} />
              <Input placeholder="Perfil: Administrador, Supervisor ou Operador" value={draft.role} onChange={(event) => setDraft((current) => ({ ...current, role: event.target.value }))} />
              <Input placeholder="Status: Ativo, Convidado ou Bloqueado" value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))} />
              <Input className="md:col-span-2" placeholder={draft.id ? "Nova senha opcional" : "Senha inicial"} value={draft.password} onChange={(event) => setDraft((current) => ({ ...current, password: event.target.value }))} />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600" onClick={() => setIsOpen(false)}>
                Cancelar
              </button>
              <button type="button" className="rounded-full bg-blue-700 px-5 py-2 text-sm font-semibold text-white" onClick={() => void saveOperator()}>
                Salvar usuario
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
