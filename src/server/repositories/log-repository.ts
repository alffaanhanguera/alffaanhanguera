import { isDatabaseConfigured } from "@/lib/database";
import { prisma } from "@/lib/prisma";

export class LogRepository {
  async listIntegrationLogs() {
    if (!isDatabaseConfigured()) {
      return [];
    }

    try {
      return await prisma.integrationLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 50
      });
    } catch {
      return [];
    }
  }

  async listAuditLogs() {
    if (!isDatabaseConfigured()) {
      return [];
    }

    try {
      return await prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          user: true
        }
      });
    } catch {
      return [];
    }
  }
}
