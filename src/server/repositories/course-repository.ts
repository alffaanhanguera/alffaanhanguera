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

export class CourseRepository {
  async findByMessage(message: string) {
    if (!isDatabaseConfigured()) {
      return null;
    }

    const normalizedMessage = normalizeText(message);
    const courses = await prisma.course.findMany({
      include: {
        offers: {
          where: { active: true },
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    return (
      courses.find((course) => normalizedMessage.includes(normalizeText(course.name))) ??
      null
    );
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
