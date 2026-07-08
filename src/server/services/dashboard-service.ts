import { DashboardRepository } from "@/server/repositories/dashboard-repository";

export class DashboardService {
  constructor(private readonly repository = new DashboardRepository()) {}

  async getSummary(range: "7d" | "30d" | "90d" | "6m" | "1y" = "7d") {
    const metrics = await this.repository.getMetrics(range);

    return {
      metrics: [
        { label: "Total de leads", value: metrics.leads.toString(), variation: "Fluxo completo do WhatsApp" },
        { label: "Humanos atendendo", value: metrics.humanAgents.toString(), variation: "Conversas com operador" },
        { label: "Bots atendendo", value: metrics.botAgents.toString(), variation: "Chatbot Juliana em atendimento" },
        { label: "Cursos vendidos", value: metrics.soldCourses.toString(), variation: "Leads matriculados" }
      ],
      charts: {
        courseSales: metrics.courseSales
      },
      latestLeads: metrics.latestLeads
    };
  }
}
