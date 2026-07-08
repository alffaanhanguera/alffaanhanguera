import { ConversationStatus } from "@prisma/client";
import { isDatabaseConfigured } from "@/lib/database";
import { prisma } from "@/lib/prisma";

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function buildLastSevenDays() {
  const today = startOfDay(new Date());
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return date;
  });
}

export class DashboardRepository {
  async getMetrics() {
    if (!isDatabaseConfigured()) {
      return {
        leads: 0,
        humanAgents: 0,
        botAgents: 0,
        soldCourses: 0,
        courseSales: [],
        leadConversion: Array.from({ length: 7 }, () => 0),
        responseTime: Array.from({ length: 7 }, () => 0)
      };
    }

    try {
      const lastSevenDays = buildLastSevenDays();
      const rangeStart = lastSevenDays[0];

      const [leads, humanAgents, botAgents, soldCourses, courseSalesRaw, recentLeads, recentConversations] = await Promise.all([
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
          select: {
            createdAt: true
          }
        }),
        prisma.conversation.findMany({
          where: {
            updatedAt: {
              gte: rangeStart
            }
          },
          select: {
            updatedAt: true,
            messages: {
              orderBy: { createdAt: "asc" },
              select: {
                direction: true,
                createdAt: true
              }
            }
          }
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

      const leadConversion = lastSevenDays.map((dayStart) => {
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        return recentLeads.filter((lead) => lead.createdAt >= dayStart && lead.createdAt < dayEnd).length;
      });

      const responseTime = lastSevenDays.map((dayStart) => {
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const samples = recentConversations
          .filter((conversation) => conversation.updatedAt >= dayStart && conversation.updatedAt < dayEnd)
          .map((conversation) => {
            const firstInbound = conversation.messages.find((message) => message.direction === "INBOUND");

            if (!firstInbound) {
              return null;
            }

            const firstOutbound = conversation.messages.find(
              (message) => message.direction === "OUTBOUND" && message.createdAt >= firstInbound.createdAt
            );

            if (!firstOutbound) {
              return null;
            }

            return Number(((firstOutbound.createdAt.getTime() - firstInbound.createdAt.getTime()) / 60000).toFixed(1));
          })
          .filter((value): value is number => value !== null);

        if (!samples.length) {
          return 0;
        }

        const average = samples.reduce((total, current) => total + current, 0) / samples.length;
        return Number(average.toFixed(1));
      });

      return {
        leads,
        humanAgents,
        botAgents,
        soldCourses,
        courseSales: courseSalesRaw.map((item) => ({
          course: courses.find((course) => course.id === item.desiredCourseId)?.name ?? "Curso sem nome",
          total: item._count.desiredCourseId
        })),
        leadConversion,
        responseTime
      };
    } catch {
      return {
        leads: 0,
        humanAgents: 0,
        botAgents: 0,
        soldCourses: 0,
        courseSales: [],
        leadConversion: Array.from({ length: 7 }, () => 0),
        responseTime: Array.from({ length: 7 }, () => 0)
      };
    }
  }
}
