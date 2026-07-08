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

  async saveFaqItem(data: {
    id?: string;
    category: string;
    question: string;
    answer: string;
    priority?: number;
  }) {
    if (!isDatabaseConfigured()) {
      return null;
    }

    if (data.id) {
      return prisma.faqItem.update({
        where: { id: data.id },
        data: {
          category: data.category,
          question: data.question,
          answer: data.answer,
          priority: data.priority ?? 0
        }
      });
    }

    return prisma.faqItem.create({
      data: {
        category: data.category,
        question: data.question,
        answer: data.answer,
        priority: data.priority ?? 0
      }
    });
  }

  async saveKnowledgeDocument(data: {
    id?: string;
    category: string;
    title: string;
    content: string;
  }) {
    if (!isDatabaseConfigured()) {
      return null;
    }

    if (data.id) {
      return prisma.knowledgeDocument.update({
        where: { id: data.id },
        data: {
          category: data.category,
          title: data.title,
          content: data.content
        }
      });
    }

    return prisma.knowledgeDocument.create({
      data: {
        category: data.category,
        title: data.title,
        content: data.content
      }
    });
  }

  async deleteFaqItem(id: string) {
    if (!isDatabaseConfigured()) {
      return null;
    }

    return prisma.faqItem.delete({
      where: { id }
    });
  }

  async deleteKnowledgeDocument(id: string) {
    if (!isDatabaseConfigured()) {
      return null;
    }

    return prisma.knowledgeDocument.delete({
      where: { id }
    });
  }
}
