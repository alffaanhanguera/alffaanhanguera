"use client";

import { useState } from "react";
import {
  Bot,
  BrainCircuit,
  CircleDollarSign,
  KeyRound,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  Workflow
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AgentItem = {
  id: string;
  name: string;
  status: string;
  description: string;
  meta: string;
};

type CourseItem = {
  id: string;
  name: string;
  price: string;
  description: string;
  status: string;
};

type OpenAiItem = {
  id: string;
  name: string;
  model: string;
  description: string;
  rulesCount: number;
};

type FlowNode = {
  id: string;
  key: string;
  title: string;
  description: string;
  footer: string;
};

type N8NWorkspaceProps = {
  userName: string;
  userInitial: string;
  agents: AgentItem[];
  courses: CourseItem[];
  openAiItems: OpenAiItem[];
  flowNodes: FlowNode[];
};

const tabs = [
  { id: "agents", label: "Agentes", icon: Bot },
  { id: "courses", label: "Cursos", icon: CircleDollarSign },
  { id: "openai", label: "OpenAI", icon: BrainCircuit },
  { id: "n8n", label: "N8N", icon: Workflow }
] as const;

export function N8NWorkspace({ userName, userInitial, agents, courses, openAiItems, flowNodes }: N8NWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("agents");

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[hsl(var(--border))] px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[hsl(var(--foreground))]">N8N</h1>
            <p className="mt-1 text-sm uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">ALFFA CRM ENTERPRISE</p>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <Button variant="outline" size="sm" className="rounded-xl">
              <span className="text-lg leading-none">◔</span>
            </Button>
            <div className="text-right">
              <p className="text-sm font-semibold">{userName}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Sair</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
              {userInitial}
            </div>
          </div>
        </div>

        <div className="px-5 py-5">
          <div className="flex flex-col gap-4 border-b border-[hsl(var(--border))] pb-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition",
                      activeTab === tab.id
                        ? "border-sky-500 text-slate-950 dark:text-white"
                        : "border-transparent text-[hsl(var(--muted-foreground))]"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {activeTab === "agents" ? (
              <Button className="rounded-xl">
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar agente
              </Button>
            ) : null}

            {activeTab === "courses" ? (
              <Button className="rounded-xl">
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar curso
              </Button>
            ) : null}

            {activeTab === "openai" ? (
              <Button variant="outline" className="rounded-xl">
                <KeyRound className="mr-2 h-4 w-4" />
                Credenciais OpenAI
              </Button>
            ) : null}

            {activeTab === "n8n" ? (
              <div className="flex flex-wrap gap-2">
                <select className="h-11 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 text-sm">
                  {agents.map((agent) => (
                    <option key={agent.id}>{agent.name}</option>
                  ))}
                </select>
                <Button variant="outline" className="rounded-xl">
                  <Plus className="mr-2 h-4 w-4" />
                  Mensagem
                </Button>
                <Button className="rounded-xl">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar fluxo
                </Button>
              </div>
            ) : null}
          </div>

          {activeTab === "agents" ? (
            <div className="pt-5">
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                <Input className="pl-11" placeholder="Pesquisar agentes" />
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {agents.map((agent) => (
                  <Card key={agent.id} className="rounded-[18px] p-0 shadow-none">
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                          <Bot className="h-5 w-5" />
                        </div>
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">{agent.status}</span>
                      </div>
                      <h3 className="mt-5 text-2xl font-semibold">{agent.name}</h3>
                      <p className="mt-3 text-sm leading-7 text-[hsl(var(--muted-foreground))]">{agent.description}</p>
                      <p className="mt-5 text-sm text-[hsl(var(--muted-foreground))]">{agent.meta}</p>
                    </div>
                    <div className="flex items-center justify-end gap-6 border-t border-[hsl(var(--border))] px-5 py-4">
                      <button type="button" className="inline-flex items-center gap-2 text-sm font-medium">
                        <Pencil className="h-4 w-4" />
                        Editar
                      </button>
                      <button type="button" className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : null}

          {activeTab === "courses" ? (
            <div className="pt-5">
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                <Input className="pl-11" placeholder="Pesquisar cursos" />
              </div>

              <div className="mt-6 grid gap-4 xl:grid-cols-3">
                {courses.map((course) => (
                  <Card key={course.id} className="rounded-[18px] p-0 shadow-none">
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm text-[hsl(var(--muted-foreground))]">Curso</p>
                          <h3 className="mt-1 text-2xl font-semibold">{course.name}</h3>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">{course.status}</span>
                      </div>
                      <p className="mt-6 text-4xl font-semibold">{course.price}</p>
                      <p className="mt-4 text-sm leading-7 text-[hsl(var(--muted-foreground))]">{course.description}</p>
                    </div>
                    <div className="flex items-center justify-end gap-6 border-t border-[hsl(var(--border))] px-5 py-4">
                      <button type="button" className="inline-flex items-center gap-2 text-sm font-medium">
                        <Pencil className="h-4 w-4" />
                        Editar
                      </button>
                      <button type="button" className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : null}

          {activeTab === "openai" ? (
            <div className="pt-5">
              <h2 className="text-3xl font-semibold">Inteligência dos agentes</h2>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Personalidade, regras e modelo aplicados nas respostas.</p>

              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {openAiItems.map((item) => (
                  <Card key={item.id} className="rounded-[18px] p-0 shadow-none">
                    <div className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                          <BrainCircuit className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-semibold">{item.name}</h3>
                          <p className="text-sm text-[hsl(var(--muted-foreground))]">{item.model}</p>
                        </div>
                      </div>

                      <p className="mt-5 text-sm leading-7 text-[hsl(var(--muted-foreground))]">{item.description}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-[hsl(var(--border))] px-5 py-4">
                      <span className="text-sm font-medium">{item.rulesCount} regras configuradas</span>
                      <span className="text-lg">›</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : null}

          {activeTab === "n8n" ? (
            <div className="pt-5">
              <h2 className="text-3xl font-semibold">Fluxo de mensagens</h2>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Arraste os blocos para alterar a ordem de execução.</p>

              <div className="mt-6 overflow-x-auto rounded-[18px] border border-[hsl(var(--border))] bg-slate-50/70 p-6 dark:bg-slate-950/30">
                <div className="flex min-w-[1180px] items-center gap-8">
                  {flowNodes.map((node, index) => (
                    <div key={node.id} className="flex items-center gap-8">
                      <div className="w-[260px] shrink-0 overflow-hidden rounded-[16px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
                        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400">⋮</span>
                            <p className="text-sm font-medium text-sky-700">{node.key}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Pencil className="h-4 w-4" />
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="text-xl font-semibold">{node.title}</h3>
                          <p className="mt-3 text-sm leading-7 text-[hsl(var(--muted-foreground))]">{node.description}</p>
                        </div>
                        <div className="border-t border-[hsl(var(--border))] px-4 py-3 text-sm text-[hsl(var(--muted-foreground))]">{node.footer}</div>
                      </div>

                      {index < flowNodes.length - 1 ? <div className="h-[2px] w-16 bg-sky-500" /> : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
