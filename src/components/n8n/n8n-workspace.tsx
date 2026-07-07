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
    <div className="-mx-4 -mt-4 min-h-[calc(100vh-7rem)] bg-[#f7fbff] text-slate-900 dark:bg-slate-950 dark:text-slate-100 lg:-mx-6 lg:-mt-6">
      <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">N8N</h1>
            <p className="mt-1 text-sm uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">ALFFA CRM ENTERPRISE</p>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <Button variant="outline" size="sm" className="h-10 rounded-xl border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <span className="text-lg leading-none">◔</span>
            </Button>
            <div className="text-right">
              <p className="text-sm font-semibold">{userName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Sair</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white">
              {userInitial}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1260px] px-5 py-6">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 border-b-2 px-4 py-2 text-[15px] font-medium transition",
                    activeTab === tab.id
                      ? "border-sky-500 text-slate-950 dark:text-white"
                      : "border-transparent text-slate-500 dark:text-slate-400"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === "agents" ? (
            <Button className="h-10 rounded-lg bg-sky-500 px-5 text-slate-950 hover:opacity-95">
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar agente
            </Button>
          ) : null}

          {activeTab === "courses" ? (
            <Button className="h-10 rounded-lg bg-sky-500 px-5 text-slate-950 hover:opacity-95">
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar curso
            </Button>
          ) : null}

          {activeTab === "openai" ? (
            <Button variant="outline" className="h-10 rounded-lg border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <KeyRound className="mr-2 h-4 w-4" />
              Credenciais OpenAI
            </Button>
          ) : null}

          {activeTab === "n8n" ? (
            <div className="flex flex-wrap gap-2">
              <select className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm dark:border-slate-700 dark:bg-slate-900">
                {agents.map((agent) => (
                  <option key={agent.id}>{agent.name}</option>
                ))}
              </select>
              <Button variant="outline" className="h-10 rounded-lg border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                <Plus className="mr-2 h-4 w-4" />
                Mensagem
              </Button>
              <Button className="h-10 rounded-lg bg-sky-500 px-5 text-slate-950 hover:opacity-95">
                <Save className="mr-2 h-4 w-4" />
                Salvar fluxo
              </Button>
            </div>
          ) : null}
        </div>

        {activeTab === "agents" ? (
          <div className="pt-5">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="h-10 rounded-lg border-slate-200 bg-white pl-11 dark:border-slate-700 dark:bg-slate-900" placeholder="Pesquisar agentes" />
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {agents.map((agent) => (
                <Card key={agent.id} className="rounded-[12px] border border-slate-200 bg-white p-0 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                        <Bot className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">{agent.status}</span>
                    </div>
                    <h3 className="mt-5 text-2xl font-semibold">{agent.name}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{agent.description}</p>
                    <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">{agent.meta}</p>
                  </div>
                  <div className="flex items-center justify-end gap-6 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
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
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="h-10 rounded-lg border-slate-200 bg-white pl-11 dark:border-slate-700 dark:bg-slate-900" placeholder="Pesquisar cursos" />
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-3">
              {courses.map((course) => (
                <Card key={course.id} className="rounded-[12px] border border-slate-200 bg-white p-0 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Curso</p>
                        <h3 className="mt-1 text-2xl font-semibold">{course.name}</h3>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">{course.status}</span>
                    </div>
                    <p className="mt-6 text-4xl font-semibold">{course.price}</p>
                    <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{course.description}</p>
                  </div>
                  <div className="flex items-center justify-end gap-6 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
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
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Personalidade, regras e modelo aplicados nas respostas.</p>

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {openAiItems.map((item) => (
                <Card key={item.id} className="rounded-[12px] border border-slate-200 bg-white p-0 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                        <BrainCircuit className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold">{item.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{item.model}</p>
                      </div>
                    </div>

                    <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.description}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 dark:border-slate-800">
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
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Arraste os blocos para alterar a ordem de execução.</p>

            <div className="mt-6 overflow-x-auto rounded-[10px] border border-slate-200 bg-[#edf3fa] p-8 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="flex min-w-[1280px] items-center gap-10">
                {flowNodes.map((node, index) => (
                  <div key={node.id} className="flex items-center gap-10">
                    <div className="w-[270px] shrink-0 overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
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
                        <h3 className="text-[31px] font-semibold leading-tight tracking-[-0.02em]">{node.title}</h3>
                        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{node.description}</p>
                      </div>
                      <div className="border-t border-slate-200 px-4 py-3 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">{node.footer}</div>
                    </div>

                    {index < flowNodes.length - 1 ? <div className="h-[2px] w-20 bg-sky-500" /> : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
