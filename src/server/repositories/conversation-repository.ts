import type { Prisma } from "@prisma/client";
import { isDatabaseConfigured } from "@/lib/database";
import { prisma } from "@/lib/prisma";

export class ConversationRepository {
  async list() {
    if (!isDatabaseConfigured()) {
      return [];
    }

    try {
      return await prisma.conversation.findMany({
        take: 30,
        orderBy: { updatedAt: "desc" },
        include: {
          lead: true,
          assignedOperator: true,
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1
          }
        }
      });
    } catch {
      return [];
    }
  }

  async createInboundMessage(params: {
    phone: string;
    content: string;
    externalMessageId?: string;
    type?: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "DOCUMENT" | "PDF" | "LOCATION";
    metadata?: Record<string, unknown>;
  }) {
    if (!isDatabaseConfigured()) {
      return {
        id: "mock-message",
        conversationId: params.phone,
        content: params.content
      };
    }

    const lead = await prisma.lead.upsert({
      where: { phone: params.phone },
      update: { lastInteractionAt: new Date() },
      create: {
        phone: params.phone,
        fullName: params.phone
      }
    });

    const conversation = await prisma.conversation.upsert({
      where: { id: lead.id },
      update: {
        unreadCount: { increment: 1 },
        lastMessageAt: new Date(),
        updatedAt: new Date()
      },
      create: {
        id: lead.id,
        leadId: lead.id,
        unreadCount: 1,
        lastMessageAt: new Date()
      }
    });

    return prisma.message.create({
      data: {
        conversationId: conversation.id,
        externalMessageId: params.externalMessageId,
        direction: "INBOUND",
        type: params.type ?? "TEXT",
        content: params.content,
        metadata: params.metadata as Prisma.InputJsonValue | undefined
      }
    });
  }

  async getRecentHistoryByPhone(phone: string, take = 12) {
    if (!isDatabaseConfigured()) {
      return null;
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        lead: {
          phone
        }
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take
        },
        lead: {
          include: {
            desiredCourse: true
          }
        }
      }
    });

    return conversation;
  }

  async createOutboundAiMessage(params: {
    conversationId: string;
    content: string;
    metadata?: Record<string, unknown>;
  }) {
    if (!isDatabaseConfigured()) {
      return {
        id: "mock-ai-message",
        conversationId: params.conversationId,
        content: params.content
      };
    }

    await prisma.conversation.update({
      where: { id: params.conversationId },
      data: {
        lastMessageAt: new Date(),
        updatedAt: new Date()
      }
    });

    return prisma.message.create({
      data: {
        conversationId: params.conversationId,
        direction: "OUTBOUND",
        type: "TEXT",
        content: params.content,
        metadata: params.metadata as Prisma.InputJsonValue | undefined
      }
    });
  }

  async updateLead(leadId: string, data: Record<string, unknown>) {
    if (!isDatabaseConfigured()) {
      return null;
    }

    return prisma.lead.update({
      where: { id: leadId },
      data: data as Prisma.LeadUpdateInput
    });
  }

  async updateConversation(conversationId: string, data: Record<string, unknown>) {
    if (!isDatabaseConfigured()) {
      return null;
    }

    return prisma.conversation.update({
      where: { id: conversationId },
      data: data as Prisma.ConversationUpdateInput
    });
  }
}
