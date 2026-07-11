import { LeadStatus, Modality } from "@prisma/client";
import {
  extractPipelineStageId,
  getStageLabel,
  LEAD_PIPELINE_STAGES,
  type LeadPipelineStageId
} from "@/lib/crm";
import { LeadRepository } from "@/server/repositories/lead-repository";
import { ConversationService } from "@/server/services/conversation-service";
import type { LeadBoardItem } from "@/types/domain";

export class LeadService {
  constructor(private readonly repository = new LeadRepository()) {}

  private mapLegacyStatusToStage(status: LeadStatus): LeadPipelineStageId {
    if (status === LeadStatus.ENROLLED) {
      return "completed-enrollment";
    }
    if (status === LeadStatus.IN_NEGOTIATION) {
      return "operator-service";
    }
    if (status === LeadStatus.READY_FOR_OPERATOR) {
      return "waiting-operator";
    }
    if (status === LeadStatus.QUALIFYING) {
      return "ai-service";
    }
    if (status === LeadStatus.LOST) {
      return "closed";
    }
    return "new-lead";
  }

  async listForPanel() {
    const leads = await this.repository.list();

    return leads.map((lead): LeadBoardItem => {
      const pipelineStageId = extractPipelineStageId(lead.conversations[0]?.tags) ?? this.mapLegacyStatusToStage(lead.status ?? LeadStatus.NEW);

      return {
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
        status: getStageLabel(pipelineStageId),
        benefitSummary: lead.benefitSummary ?? "Nenhum beneficio",
        tags: lead.conversations[0]?.tags ?? [],
        pipelineStageId
      };
    });
  }

  async getKanbanData() {
    const leads = await this.listForPanel();

    return LEAD_PIPELINE_STAGES.map((stage) => ({
      id: stage.id,
      title: stage.label,
      description: stage.description,
      accent: stage.accent,
      leads: leads.filter((lead) => lead.pipelineStageId === stage.id)
    }));
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
      input.status === "Atendimento IA"
        ? LeadStatus.QUALIFYING
        : input.status === "Aguardando Operador"
          ? LeadStatus.READY_FOR_OPERATOR
          : input.status === "Em Atendimento pelo Operador" ||
              input.status === "Retornos Agendados" ||
              input.status === "Aguardando Cliente" ||
              input.status === "Operador sem Responder"
            ? LeadStatus.IN_NEGOTIATION
            : input.status === "Matrículas Concluídas"
              ? LeadStatus.ENROLLED
              : input.status === "Encerrados"
                ? LeadStatus.LOST
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
    const pipelineStageId = LEAD_PIPELINE_STAGES.some((stage) => stage.id === columnId)
      ? (columnId as LeadPipelineStageId)
      : "new-lead";

    const status =
      pipelineStageId === "completed-enrollment"
        ? LeadStatus.ENROLLED
        : pipelineStageId === "closed"
          ? LeadStatus.LOST
          : pipelineStageId === "operator-service" ||
              pipelineStageId === "scheduled-followup" ||
              pipelineStageId === "waiting-customer" ||
              pipelineStageId === "operator-sla"
            ? LeadStatus.IN_NEGOTIATION
            : pipelineStageId === "waiting-operator"
              ? LeadStatus.READY_FOR_OPERATOR
              : pipelineStageId === "ai-service"
                ? LeadStatus.QUALIFYING
                : LeadStatus.NEW;

    await this.repository.update(id, {
      status
    });

    await new ConversationService().updateLeadPipelineStage(id, pipelineStageId);

    return this.getKanbanData();
  }

  async deleteLead(id: string) {
    await this.repository.remove(id);
    return this.listForPanel();
  }
}
