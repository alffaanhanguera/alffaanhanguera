import { LeadStatus, Modality } from "@prisma/client";
import { LeadRepository } from "@/server/repositories/lead-repository";
import type { LeadBoardItem } from "@/types/domain";

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

    return leads.map((lead): LeadBoardItem => ({
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
      region: lead.region ?? "Nao informada",
      cpf: lead.cpf ?? "",
      email: lead.email ?? "",
      birthDate: lead.birthDate ? new Intl.DateTimeFormat("pt-BR").format(lead.birthDate) : "",
      companyName: lead.companyName ?? "",
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

  async updateLead(input: {
    id: string;
    name: string;
    phone: string;
    course: string;
    modality: string;
    city: string;
    region: string;
    cpf: string;
    email: string;
    birthDate: string;
    companyName: string;
    benefitSummary: string;
    status: string;
  }) {
    const lead = await this.repository.findById(input.id);

    if (!lead) {
      throw new Error("Lead nao encontrado.");
    }

    const nextStatus =
      input.status === "Qualificando"
        ? LeadStatus.QUALIFYING
        : input.status === "Pronto para operador"
          ? LeadStatus.READY_FOR_OPERATOR
          : input.status === "Negociacao"
            ? LeadStatus.IN_NEGOTIATION
            : input.status === "Matriculado"
              ? LeadStatus.ENROLLED
              : LeadStatus.NEW;

    const nextModality =
      input.modality === "EAD 100% Online" || input.modality === "EAD"
        ? Modality.EAD
        : input.modality === "Semipresencial"
          ? Modality.SEMIPRESENTIAL
          : input.modality === "Presencial"
            ? Modality.PRESENTIAL
            : null;

    const birthDate = input.birthDate
      ? (() => {
          const [day, month, year] = input.birthDate.split("/");
          if (!day || !month || !year) {
            return null;
          }
          const parsed = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
          return Number.isNaN(parsed.getTime()) ? null : parsed;
        })()
      : null;

    await this.repository.update(input.id, {
      fullName: input.name,
      phone: input.phone,
      city: input.city || null,
      region: input.region || null,
      cpf: input.cpf || null,
      email: input.email || null,
      birthDate,
      companyName: input.companyName || null,
      benefitSummary: input.benefitSummary || null,
      desiredModality: nextModality,
      status: nextStatus
    });

    return this.listForPanel();
  }

  async updateLeadStatus(id: string, columnId: string) {
    const status =
      columnId === "qualifying"
        ? LeadStatus.QUALIFYING
        : columnId === "ready"
          ? LeadStatus.READY_FOR_OPERATOR
          : columnId === "negotiation"
            ? LeadStatus.IN_NEGOTIATION
            : LeadStatus.NEW;

    await this.repository.update(id, {
      status
    });

    return this.getKanbanData();
  }

  async deleteLead(id: string) {
    await this.repository.remove(id);
    return this.listForPanel();
  }
}
