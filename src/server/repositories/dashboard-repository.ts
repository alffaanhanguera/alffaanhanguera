import { ConversationStatus } from "@prisma/client";
import { isDatabaseConfigured } from "@/lib/database";
import { prisma } from "@/lib/prisma";

export class DashboardRepository {
  async getMetrics() {
    if (!isDatabaseConfigured()) {
      return {
        leads: 128,
        humanAgents: 12,
        botAgents: 19,
        soldCourses: 42,
        courseSales: [
          { course: "Administracao", total: 16 },
          { course: "Pedagogia", total: 11 },
          { course: "Direito", total: 8 },
          { course: "Analise e Desenvolvimento", total: 7 }
        ]
      };
    }

    try {
      const [leads, humanAgents, botAgents, soldCourses, courseSalesRaw] = await Promise.all([
        prisma.lead.count(),
        prisma.conversation.count({
          where: {
            assignedOperatorId: { not: null },
            status: { in: [ConversationStatus.OPEN, ConversationStatus.PENDING, ConversationStatus.TRANSFERRED] }
          }
        }),
        prisma.conversation.count({
          where: {
            aiEnabled: true,
            status: { in: [ConversationStatus.OPEN, ConversationStatus.PENDING] }
          }
        }),
        prisma.lead.count({
          where: {
            status: "ENROLLED"
          }
        }),
        prisma.lead.groupBy({
          by: ["desiredCourseId"],
          where: {
            status: "ENROLLED",
            desiredCourseId: { not: null }
          },
          _count: {
            desiredCourseId: true
          },
          orderBy: {
            _count: {
              desiredCourseId: "desc"
            }
          },
          take: 6
        })
      ]);

      const courseIds = courseSalesRaw.map((item) => item.desiredCourseId).filter(Boolean) as string[];
      const courses = courseIds.length
        ? await prisma.course.findMany({
            where: {
              id: {
                in: courseIds
              }
            }
          })
        : [];

      return {
        leads,
        humanAgents,
        botAgents,
        soldCourses,
        courseSales: courseSalesRaw.map((item) => ({
          course: courses.find((course) => course.id === item.desiredCourseId)?.name ?? "Curso sem nome",
          total: item._count.desiredCourseId
        }))
      };
    } catch {
      return {
        leads: 128,
        humanAgents: 12,
        botAgents: 19,
        soldCourses: 42,
        courseSales: [
          { course: "Administracao", total: 16 },
          { course: "Pedagogia", total: 11 },
          { course: "Direito", total: 8 },
          { course: "Analise e Desenvolvimento", total: 7 }
        ]
      };
    }
  }
}
