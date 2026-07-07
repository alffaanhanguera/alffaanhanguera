import { DashboardRepository } from "@/server/repositories/dashboard-repository";

export class DashboardService {
  constructor(private readonly repository = new DashboardRepository()) {}

  async getSummary() {
    const metrics = await this.repository.getMetrics();

    return {
      metrics: [
        { label: "Total de leads", value: metrics.leads.toString(), variation: "Fluxo completo do WhatsApp" },
        { label: "Humanos atendendo", value: metrics.humanAgents.toString(), variation: "Conversas com operador" },
        { label: "Bots atendendo", value: metrics.botAgents.toString(), variation: "Chatbot Juliana em atendimento" },
        { label: "Cursos vendidos", value: metrics.soldCourses.toString(), variation: "Leads matriculados" }
      ],
      charts: {
        leadConversion: [42, 51, 57, 63, 70, 79, 84],
        responseTime: [5.2, 4.8, 4.1, 3.6, 3.2, 2.8, 2.4],
        courseSales: metrics.courseSales.length ? metrics.courseSales : [{ course: "Administracao", total: 16 }]
      }
    };
  }
}
