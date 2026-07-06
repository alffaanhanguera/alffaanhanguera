import type { Prisma } from "@prisma/client";
import { isDatabaseConfigured } from "@/lib/database";
import { prisma } from "@/lib/prisma";

export class IntegrationLogRepository {
  async create(data: {
    provider: string;
    endpoint: string;
    statusCode?: number;
    message: string;
    payload?: Record<string, unknown>;
    response?: Record<string, unknown>;
  }) {
    if (!isDatabaseConfigured()) {
      return null;
    }

    return prisma.integrationLog.create({
      data: {
        ...data,
        payload: data.payload as Prisma.InputJsonValue | undefined,
        response: data.response as Prisma.InputJsonValue | undefined
      }
    });
  }
}
