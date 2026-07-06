import { DashboardRepository } from "@/server/repositories/dashboard-repository";

export class DashboardService {
  constructor(private readonly repository = new DashboardRepository()) {}

  async getSummary() {
    const metrics = await this.repository.getMetrics();

    return {
      metrics: [
        { label: "Leads captados", value: metrics.leads.toString(), variation: "+18% na semana" },
        { label: "Conversas totais", value: metrics.conversations.toString(), variation: "+9% com IA ativa" },
        { label: "Operadores ativos", value: metrics.users.toString(), variation: "Cobertura total" },
        { label: "Atendimentos abertos", value: metrics.openConversations.toString(), variation: "Fila sob controle" }
      ],
      charts: {
        leadConversion: [48, 58, 61, 69, 74, 82, 88],
        responseTime: [4.2, 3.8, 3.5, 3.1, 2.8, 2.7, 2.4]
      }
    };
  }
}
