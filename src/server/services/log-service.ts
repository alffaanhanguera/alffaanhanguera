import { LogRepository } from "@/server/repositories/log-repository";

export class LogService {
  constructor(private readonly repository = new LogRepository()) {}

  async getIntegrationLogs() {
    const logs = await this.repository.listIntegrationLogs();

    return logs.map((log) => ({
      id: log.id,
      provider: log.provider,
      endpoint: log.endpoint,
      statusCode: log.statusCode ?? 0,
      message: log.message,
      createdAt: new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
      }).format(log.createdAt)
    }));
  }

  async getAuditLogs() {
    const logs = await this.repository.listAuditLogs();

    return logs.map((log) => ({
      id: log.id,
      user: log.user?.name ?? "Sistema",
      entity: log.entity,
      action: log.action,
      description: log.description,
      createdAt: new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
      }).format(log.createdAt)
    }));
  }
}
