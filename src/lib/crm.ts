export const PIPELINE_TAG_PREFIX = "pipeline:";

export const LEAD_PIPELINE_STAGES = [
  {
    id: "new-lead",
    label: "Novo Lead",
    description: "Entrada inicial do lead na operação.",
    accent: "bg-slate-400",
    badgeTone: "slate"
  },
  {
    id: "ai-service",
    label: "Atendimento IA",
    description: "Fluxo automatizado ativo com a Juliana.",
    accent: "bg-sky-500",
    badgeTone: "sky"
  },
  {
    id: "waiting-operator",
    label: "Aguardando Operador",
    description: "Fila aguardando um operador assumir.",
    accent: "bg-red-500",
    badgeTone: "red"
  },
  {
    id: "operator-service",
    label: "Em Atendimento pelo Operador",
    description: "Operador conduzindo o atendimento ativo.",
    accent: "bg-orange-500",
    badgeTone: "orange"
  },
  {
    id: "scheduled-followup",
    label: "Retornos Agendados",
    description: "Retorno combinado e aguardando recontato.",
    accent: "bg-blue-500",
    badgeTone: "blue"
  },
  {
    id: "waiting-customer",
    label: "Aguardando Cliente",
    description: "Cliente precisa responder para continuidade.",
    accent: "bg-yellow-400",
    badgeTone: "yellow"
  },
  {
    id: "operator-sla",
    label: "Operador sem Responder",
    description: "SLA rompido aguardando retomada do operador.",
    accent: "bg-rose-600",
    badgeTone: "red"
  },
  {
    id: "completed-enrollment",
    label: "Matrículas Concluídas",
    description: "Lead convertido com matrícula concluída.",
    accent: "bg-green-500",
    badgeTone: "green"
  },
  {
    id: "closed",
    label: "Encerrados",
    description: "Fluxo encerrado sem atendimento ativo.",
    accent: "bg-zinc-500",
    badgeTone: "gray"
  }
] as const;

export const CONVERSATION_TAG_PRESETS = [
  "Inscrição Pendente",
  "Pagamento Pendente",
  "Vestibular Pendente",
  "Aceite Pendente",
  "Acesso Pendente",
  "Matrícula Finalizada",
  "Bolsa Empresa",
  "Bolsa Enem",
  "Bolsa Transferência",
  "Bolsa"
] as const;

export type LeadPipelineStageId = (typeof LEAD_PIPELINE_STAGES)[number]["id"];

export function makePipelineTag(stageId: LeadPipelineStageId) {
  return `${PIPELINE_TAG_PREFIX}${stageId}`;
}

export function isPipelineTag(tag: string) {
  return tag.startsWith(PIPELINE_TAG_PREFIX);
}

export function getStageDefinition(stageId: LeadPipelineStageId) {
  return LEAD_PIPELINE_STAGES.find((stage) => stage.id === stageId) ?? LEAD_PIPELINE_STAGES[0];
}

export function getStageLabel(stageId: LeadPipelineStageId) {
  return getStageDefinition(stageId).label;
}

export function extractPipelineStageId(tags: string[] | null | undefined): LeadPipelineStageId | null {
  const pipelineTag = tags?.find((tag) => isPipelineTag(tag));

  if (!pipelineTag) {
    return null;
  }

  const stageId = pipelineTag.slice(PIPELINE_TAG_PREFIX.length) as LeadPipelineStageId;
  return LEAD_PIPELINE_STAGES.some((stage) => stage.id === stageId) ? stageId : null;
}

export function stripPipelineTags(tags: string[] | null | undefined) {
  return (tags ?? []).filter((tag) => !isPipelineTag(tag));
}

export function mergePipelineTag(tags: string[] | null | undefined, stageId: LeadPipelineStageId) {
  return [...stripPipelineTags(tags), makePipelineTag(stageId)];
}

export function normalizeTags(tags: string[] | null | undefined) {
  return Array.from(
    new Set(
      (tags ?? [])
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  );
}
