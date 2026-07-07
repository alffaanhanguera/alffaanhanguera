import { Modality } from "@prisma/client";
import { isDatabaseConfigured } from "@/lib/database";
import { prisma } from "@/lib/prisma";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function tokenize(value: string) {
  return normalizeText(value)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3);
}

export class CourseRepository {
  async listCatalog() {
    if (!isDatabaseConfigured()) {
      return [];
    }

    try {
      return await prisma.course.findMany({
        include: {
          offers: {
            where: { active: true },
            orderBy: { createdAt: "desc" },
            take: 1
          }
        },
        orderBy: { name: "asc" },
        take: 12
      });
    } catch {
      return [];
    }
  }

  async findByMessage(message: string) {
    if (!isDatabaseConfigured()) {
      return null;
    }

    const normalizedMessage = normalizeText(message);
    const messageTokens = tokenize(message);
    const courses = await prisma.course.findMany({
      include: {
        offers: {
          where: { active: true },
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    const exactMatch = courses.find((course) => {
      const normalizedName = normalizeText(course.name);
      const normalizedCode = normalizeText(course.code);
      return normalizedMessage.includes(normalizedName) || normalizedMessage.includes(normalizedCode);
    });

    if (exactMatch) {
      return exactMatch;
    }

    const ranked = courses
      .map((course) => {
        const nameTokens = tokenize(course.name);
        const tokenMatches = nameTokens.filter((token) => messageTokens.includes(token)).length;
        const startsWithBoost = nameTokens.some((token) => normalizedMessage.startsWith(token)) ? 1 : 0;
        const score = tokenMatches + startsWithBoost;

        return {
          course,
          score,
          tokenCount: nameTokens.length
        };
      })
      .filter((item) => item.score > 0)
      .sort((left, right) => right.score - left.score || left.tokenCount - right.tokenCount);

    if (ranked[0] && (ranked[0].score >= 2 || (messageTokens.length === 1 && ranked[0].score >= 1))) {
      return ranked[0].course;
    }

    return null;
  }

  async findById(courseId: string) {
    if (!isDatabaseConfigured()) {
      return null;
    }

    return prisma.course.findUnique({
      where: { id: courseId },
      include: {
        offers: {
          where: { active: true },
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });
  }

  async listNames(limit = 8) {
    if (!isDatabaseConfigured()) {
      return [];
    }

    try {
      const courses = await prisma.course.findMany({
        select: {
          id: true,
          name: true
        },
        orderBy: { name: "asc" },
        take: limit
      });

      return courses.map((course) => course.name);
    } catch {
      return [];
    }
  }

  getAvailableModalities(course: {
    hasPresential: boolean;
    hasSemipresential: boolean;
    hasEad: boolean;
  }) {
    const modalities: Modality[] = [];

    if (course.hasPresential) {
      modalities.push(Modality.PRESENTIAL);
    }

    if (course.hasSemipresential) {
      modalities.push(Modality.SEMIPRESENTIAL);
    }

    if (course.hasEad) {
      modalities.push(Modality.EAD);
    }

    return modalities;
  }
}
