import { ConversationStatus } from "@prisma/client";
import { isDatabaseConfigured } from "@/lib/database";
import { prisma } from "@/lib/prisma";

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

export type DashboardRange = "7d" | "30d" | "90d" | "6m" | "1y";

function buildRangeStart(range: DashboardRange) {
  const date = startOfDay(new Date());

  if (range === "30d") {
    date.setDate(date.getDate() - 29);
    return date;
  }

  if (range === "90d") {
    date.setDate(date.getDate() - 89);
    return date;
  }

  if (range === "6m") {
    date.setMonth(date.getMonth() - 6);
    return date;
  }

  if (range === "1y") {
    date.setFullYear(date.getFullYear() - 1);
    return date;
  }

  date.setDate(date.getDate() - 6);
  return date;
}

export class DashboardRepository {
  async getMetrics(range: DashboardRange = "7d") {
    if (!isDatabaseConfigured()) {
      return {
        leads: 0,
        humanAgents: 0,
        botAgents: 0,
        soldCourses: 0,
        courseSales: [],
        latestLeads: []
      };
    }

    try {
      const rangeStart = buildRangeStart(range);

      const [leads, humanAgents, botAgents, soldCourses, courseSalesRaw, latestLeads] = await Promise.all([
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
        }),
        prisma.lead.findMany({
          where: {
            createdAt: {
              gte: rangeStart
            }
          },
          include: {
            desiredCourse: true
          },
          orderBy: { createdAt: "desc" },
          take: 12
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
        })),
        latestLeads: latestLeads.map((lead) => ({
          id: lead.id,
          name: lead.fullName,
          phone: lead.phone,
          course: lead.desiredCourse?.name ?? "Nao informado",
          city: lead.city ?? "Nao informada",
          createdAt: lead.createdAt
        }))
      };
    } catch {
      return {
        leads: 0,
        humanAgents: 0,
        botAgents: 0,
        soldCourses: 0,
        courseSales: [],
        latestLeads: []
      };
    }
  }
}
