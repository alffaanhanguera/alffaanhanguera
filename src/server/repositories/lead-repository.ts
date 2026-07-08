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

  async findById(id: string) {
    if (!isDatabaseConfigured()) {
      return null;
    }

    try {
      return await prisma.lead.findUnique({
        where: { id },
        include: {
          desiredCourse: true
        }
      });
    } catch {
      return null;
    }
  }

  async update(id: string, data: Record<string, unknown>) {
    if (!isDatabaseConfigured()) {
      return null;
    }

    return prisma.lead.update({
      where: { id },
      data
    });
  }

  async remove(id: string) {
    if (!isDatabaseConfigured()) {
      return null;
    }

    return prisma.lead.delete({
      where: { id }
    });
  }
}
