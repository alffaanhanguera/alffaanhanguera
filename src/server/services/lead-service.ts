import { LeadStatus, Modality } from "@prisma/client";
import { LeadRepository } from "@/server/repositories/lead-repository";

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
          status: "QUALIFYING",
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
      status: lead.status ?? LeadStatus.NEW,
      benefitSummary: lead.benefitSummary ?? "Nenhum beneficio"
    }));
  }
}
