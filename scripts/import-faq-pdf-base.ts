import { readFile } from "node:fs/promises";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function cleanText(value: string) {
  return value
    .replace(/\f/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function splitChapterSections(text: string) {
  const matches = [...text.matchAll(/CAPÍTULO\s+(\d+)\s+[–-]\s+([\s\S]*?)(?=CAPÍTULO\s+\d+\s+[–-]|$)/g)];

  return matches.map((match) => {
    const chapterNumber = match[1];
    const body = cleanText(match[2]);
    const lines = body.split("\n").map((line) => line.trim()).filter(Boolean);
    const title = lines[0] ?? `Capítulo ${chapterNumber}`;
    const content = lines.slice(1).join("\n");

    return {
      chapterNumber,
      title,
      content
    };
  });
}

function extractFaqItems(content: string, chapterLabel: string) {
  const headingPattern = "(?:INT(?:ENÇÃO)?(?:\\s+|-)?\\d{3}\\s+[–-]|INTERRUPÇÃO\\s+\\d{3}\\s+[–-]|REGRA GERAL Nº \\d+)";
  const sectionRegex = new RegExp(`(${headingPattern}[\\s\\S]*?)(?=(?:${headingPattern}|REGRA OPERACIONAL DO CAPÍTULO|$))`, "g");
  const matches = [...content.matchAll(sectionRegex)];

  return matches
    .map((match) => {
      const block = cleanText(match[0]);
      const titleLine = block.split("\n")[0] ?? "";
      const responseMatch = block.match(/Resposta Principal\n([\s\S]*?)(?=\n(?:Variação|Retorno ao Fluxo|Observação|Regra|Objetivo|Tipo da Intenção|Nunca responder|$))/i);
      const answer = cleanText(responseMatch?.[1] ?? "");

      if (!answer) {
        return null;
      }

      return {
        category: `PDF FAQ - ${chapterLabel}`,
        question: titleLine,
        answer,
        priority: chapterLabel.includes("FAQ ACADÊMICA") || chapterLabel.includes("INTERRUPÇÕES") ? 10 : 5
      };
    })
    .filter((item): item is { category: string; question: string; answer: string; priority: number } => item !== null);
}

async function main() {
  const sourcePath = process.argv[2];

  if (!sourcePath) {
    throw new Error("Informe o caminho do arquivo .txt extraído do PDF.");
  }

  const raw = await readFile(sourcePath, "utf8");
  const text = cleanText(raw);
  const chapters = splitChapterSections(text);

  const knowledgeDocuments = chapters.map((chapter) => ({
    category: "PDF FAQ",
    title: `Capítulo ${chapter.chapterNumber} - ${chapter.title}`,
    content: chapter.content
  }));

  const faqItems = chapters.flatMap((chapter) =>
    extractFaqItems(chapter.content, `Capítulo ${chapter.chapterNumber} - ${chapter.title}`)
  );

  await prisma.faqItem.deleteMany({
    where: {
      category: {
        startsWith: "PDF FAQ"
      }
    }
  });

  await prisma.knowledgeDocument.deleteMany({
    where: {
      category: "PDF FAQ"
    }
  });

  if (knowledgeDocuments.length) {
    await prisma.knowledgeDocument.createMany({
      data: knowledgeDocuments
    });
  }

  if (faqItems.length) {
    await prisma.faqItem.createMany({
      data: faqItems
    });
  }

  console.log(
    JSON.stringify(
      {
        chapters: knowledgeDocuments.length,
        faqItems: faqItems.length
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
