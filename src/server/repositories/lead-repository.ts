import { isDatabaseConfigured } from "@/lib/database";
import { prisma } from "@/lib/prisma";

export class LeadRepository {
  async list() {
    if (!isDatabaseConfigured()) {
      return [];
    }

    try {
      return await prisma.lead.findMany({
        orderBy: { updatedAt: "desc" },
        include: {
          desiredCourse: true,
          conversations: {
            orderBy: { updatedAt: "desc" },
            take: 1
          }
        }
      });
    } catch {
      return [];
    }
  }
}
