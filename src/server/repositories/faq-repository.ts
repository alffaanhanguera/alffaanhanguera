import { isDatabaseConfigured } from "@/lib/database";
import { prisma } from "@/lib/prisma";

export class FaqRepository {
  async listFaqItems() {
    if (!isDatabaseConfigured()) {
      return [];
    }

    try {
      return await prisma.faqItem.findMany({
        where: { active: true },
        orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
        take: 30
      });
    } catch {
      return [];
    }
  }

  async listKnowledgeDocuments() {
    if (!isDatabaseConfigured()) {
      return [];
    }

    try {
      return await prisma.knowledgeDocument.findMany({
        where: { active: true },
        orderBy: { updatedAt: "desc" },
        take: 20
      });
    } catch {
      return [];
    }
  }
}
