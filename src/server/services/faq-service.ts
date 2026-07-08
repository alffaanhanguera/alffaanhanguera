import { FaqRepository } from "@/server/repositories/faq-repository";

export class FaqService {
  constructor(private readonly repository = new FaqRepository()) {}

  async getPanelData() {
    const [faqItems, knowledgeDocuments] = await Promise.all([
      this.repository.listFaqItems(),
      this.repository.listKnowledgeDocuments()
    ]);

    return {
      faqItems,
      knowledgeDocuments
    };
  }
}
