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

  async saveFaqItem(input: {
    id?: string;
    category: string;
    question: string;
    answer: string;
    priority?: number;
  }) {
    await this.repository.saveFaqItem(input);
    return this.getPanelData();
  }

  async saveKnowledgeDocument(input: {
    id?: string;
    category: string;
    title: string;
    content: string;
  }) {
    await this.repository.saveKnowledgeDocument(input);
    return this.getPanelData();
  }

  async deleteFaqItem(id: string) {
    await this.repository.deleteFaqItem(id);
    return this.getPanelData();
  }

  async deleteKnowledgeDocument(id: string) {
    await this.repository.deleteKnowledgeDocument(id);
    return this.getPanelData();
  }
}
