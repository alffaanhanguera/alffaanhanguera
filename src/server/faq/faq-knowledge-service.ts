import { FaqRepository } from "@/server/repositories/faq-repository";

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

function scoreMatch(messageTokens: string[], haystack: string) {
  const haystackTokens = tokenize(haystack);
  const tokenSet = new Set(haystackTokens);
  return messageTokens.reduce((total, token) => total + (tokenSet.has(token) ? 1 : 0), 0);
}

export class FaqKnowledgeService {
  constructor(private readonly repository = new FaqRepository()) {}

  async buildContext() {
    const [faqItems, knowledgeDocuments] = await Promise.all([
      this.repository.listFaqItems(),
      this.repository.listKnowledgeDocuments()
    ]);

    return {
      faqItems,
      knowledgeDocuments
    };
  }

  async findBestAnswer(message: string) {
    const normalizedMessage = normalizeText(message);
    const messageTokens = tokenize(message);

    if (!messageTokens.length) {
      return null;
    }

    const { faqItems, knowledgeDocuments } = await this.buildContext();

    const faqMatches = faqItems
      .map((item) => ({
        type: "faq" as const,
        title: item.question,
        answer: item.answer,
        category: item.category,
        score:
          scoreMatch(messageTokens, `${item.category} ${item.question} ${item.answer}`) +
          (normalizedMessage.includes(normalizeText(item.question)) ? 3 : 0)
      }))
      .filter((item) => item.score > 0);

    const documentMatches = knowledgeDocuments
      .map((item) => ({
        type: "document" as const,
        title: item.title,
        answer: item.content,
        category: item.category,
        score:
          scoreMatch(messageTokens, `${item.category} ${item.title} ${item.content}`) +
          (normalizedMessage.includes(normalizeText(item.title)) ? 2 : 0)
      }))
      .filter((item) => item.score > 0);

    const ranked = [...faqMatches, ...documentMatches].sort((left, right) => right.score - left.score);

    if (!ranked[0] || ranked[0].score < 2) {
      return null;
    }

    return ranked[0];
  }
}
