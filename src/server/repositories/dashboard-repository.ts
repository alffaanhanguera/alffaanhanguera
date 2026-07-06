import { ConversationStatus } from "@prisma/client";
import { isDatabaseConfigured } from "@/lib/database";
import { prisma } from "@/lib/prisma";

export class DashboardRepository {
  async getMetrics() {
    if (!isDatabaseConfigured()) {
      return {
        leads: 128,
        conversations: 87,
        users: 12,
        openConversations: 19
      };
    }

    try {
      const [leads, conversations, users, openConversations] = await Promise.all([
        prisma.lead.count(),
        prisma.conversation.count(),
        prisma.user.count(),
        prisma.conversation.count({ where: { status: ConversationStatus.OPEN } })
      ]);

      return {
        leads,
        conversations,
        users,
        openConversations
      };
    } catch {
      return {
        leads: 128,
        conversations: 87,
        users: 12,
        openConversations: 19
      };
    }
  }
}
