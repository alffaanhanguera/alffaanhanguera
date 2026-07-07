import { LeadStatus, Modality } from "@prisma/client";
import { LeadRepository } from "@/server/repositories/lead-repository";

function formatLeadStatus(status: LeadStatus) {
  if (status === LeadStatus.NEW) {
    return "Novo";
  }
  if (status === LeadStatus.QUALIFYING) {
    return "Qualificando";
  }
  if (status === LeadStatus.READY_FOR_OPERATOR) {
    return "Pronto para operador";
  }
  if (status === LeadStatus.IN_NEGOTIATION) {
    return "Negociacao";
  }
  if (status === LeadStatus.ENROLLED) {
    return "Matriculado";
  }
  return "Perdido";
}

export class LeadService {
  constructor(private readonly repository = new LeadRepository()) {}

  async listForPanel() {
    const leads = await this.repository.list();

    if (leads.length === 0) {
      return [
        {
          id: "mock-lead",
          name: "Maria Silva Santos",
          phone: "5511999999999",
          course: "Administracao",
          modality: "EAD 100% Online",
          city: "Sao Paulo",
          status: "Qualificando",
          benefitSummary: "ENEM identificado"
        }
      ];
    }

    return leads.map((lead) => ({
      id: lead.id,
      name: lead.fullName,
      phone: lead.phone,
      course: lead.desiredCourse?.name ?? "Nao informado",
      modality:
        lead.desiredModality === Modality.EAD
          ? "EAD 100% Online"
          : lead.desiredModality === Modality.SEMIPRESENTIAL
            ? "Semipresencial"
            : lead.desiredModality === Modality.PRESENTIAL
              ? "Presencial"
              : "Nao definida",
      city: lead.city ?? "Nao informada",
      status: formatLeadStatus(lead.status ?? LeadStatus.NEW),
      benefitSummary: lead.benefitSummary ?? "Nenhum beneficio"
    }));
  }

  async getKanbanData() {
    const leads = await this.listForPanel();

    const groups = {
      new: leads.filter((lead) => lead.status === "Novo"),
      qualifying: leads.filter((lead) => lead.status === "Qualificando"),
      ready: leads.filter((lead) => lead.status === "Pronto para operador"),
      negotiation: leads.filter((lead) => lead.status === "Negociacao" || lead.status === "Matriculado")
    };

    return [
      {
        id: "new",
        title: "Entrada",
        description: "Leads recem captados pelo WhatsApp.",
        accent: "bg-sky-500",
        leads: groups.new
      },
      {
        id: "qualifying",
        title: "Qualificacao IA",
        description: "Fluxo inicial e coleta de dados permitidos.",
        accent: "bg-amber-500",
        leads: groups.qualifying
      },
      {
        id: "ready",
        title: "Pronto para humano",
        description: "Lead completo aguardando operador.",
        accent: "bg-emerald-500",
        leads: groups.ready
      },
      {
        id: "negotiation",
        title: "Fechamento",
        description: "Negociacao e cursos vendidos.",
        accent: "bg-violet-500",
        leads: groups.negotiation
      }
    ];
  }
}
