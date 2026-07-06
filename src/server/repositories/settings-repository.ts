import { isDatabaseConfigured } from "@/lib/database";
import { prisma } from "@/lib/prisma";

export class SettingsRepository {
  async getCurrentSettings() {
    if (!isDatabaseConfigured()) {
      return { ai: null, zapi: null };
    }

    try {
      const [ai, zapi] = await Promise.all([
        prisma.aiSetting.findFirst({ orderBy: { updatedAt: "desc" } }),
        prisma.zApiSetting.findFirst({ orderBy: { updatedAt: "desc" } })
      ]);

      return { ai, zapi };
    } catch {
      return { ai: null, zapi: null };
    }
  }
}
