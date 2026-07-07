/* global console, process */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function parseBoolean(value) {
  const normalized = normalizeText(value);
  return normalized === "sim" || normalized === "s";
}

function parseDurationSemesters(value) {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function parseCsv(content) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const [, ...rows] = lines;

  return rows.map((row) => {
    const [
      code,
      name,
      type,
      duration,
      presential,
      semipresential,
      ead,
      matutino,
      vespertino,
      noturno,
      flexible
    ] = row.split(";");

    return {
      code: code.trim(),
      name: name.trim(),
      type: type.trim(),
      durationSemesters: parseDurationSemesters(duration),
      hasPresential: parseBoolean(presential),
      hasSemipresential: parseBoolean(semipresential),
      hasEad: parseBoolean(ead),
      hasMatutino: parseBoolean(matutino),
      hasVespertino: parseBoolean(vespertino),
      hasNoturno: parseBoolean(noturno),
      hasFlexibleHours: parseBoolean(flexible)
    };
  });
}

async function main() {
  const csvPath = resolve(process.cwd(), "prisma/data/CURSOS.csv");
  const content = readFileSync(csvPath).toString("latin1");
  const courses = parseCsv(content);

  for (const course of courses) {
    const persistedCourse = await prisma.course.upsert({
      where: { code: course.code },
      update: {
        name: course.name,
        type: course.type,
        durationSemesters: course.durationSemesters,
        hasPresential: course.hasPresential,
        hasSemipresential: course.hasSemipresential,
        hasEad: course.hasEad,
        hasMatutino: course.hasMatutino,
        hasVespertino: course.hasVespertino,
        hasNoturno: course.hasNoturno,
        hasFlexibleHours: course.hasFlexibleHours,
        autoOfferMode: course.hasEad,
        observations: course.hasEad
          ? "Oferta EAD padrao com mensalidade e matricula de R$ 109,00."
          : null
      },
      create: {
        code: course.code,
        name: course.name,
        type: course.type,
        durationSemesters: course.durationSemesters,
        hasPresential: course.hasPresential,
        hasSemipresential: course.hasSemipresential,
        hasEad: course.hasEad,
        hasMatutino: course.hasMatutino,
        hasVespertino: course.hasVespertino,
        hasNoturno: course.hasNoturno,
        hasFlexibleHours: course.hasFlexibleHours,
        autoOfferMode: course.hasEad,
        observations: course.hasEad
          ? "Oferta EAD padrao com mensalidade e matricula de R$ 109,00."
          : null
      }
    });

    if (course.hasEad) {
      await prisma.offer.upsert({
        where: { id: `offer_${course.code.toLowerCase()}_ead` },
        update: {
          courseId: persistedCourse.id,
          monthlyPrice: "109.00",
          enrollmentFee: "109.00",
          firstMonthlyDueLabel: "Agosto",
          durationLabel: `${course.durationSemesters} semestres`,
          notes: "Oferta EAD padrao fixa de R$ 109,00 para mensalidade e matricula.",
          active: true
        },
        create: {
          id: `offer_${course.code.toLowerCase()}_ead`,
          courseId: persistedCourse.id,
          monthlyPrice: "109.00",
          enrollmentFee: "109.00",
          firstMonthlyDueLabel: "Agosto",
          durationLabel: `${course.durationSemesters} semestres`,
          notes: "Oferta EAD padrao fixa de R$ 109,00 para mensalidade e matricula.",
          active: true
        }
      });
    } else {
      await prisma.offer.updateMany({
        where: { courseId: persistedCourse.id },
        data: { active: false }
      });
    }
  }

  console.log(JSON.stringify({ imported: courses.length }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
