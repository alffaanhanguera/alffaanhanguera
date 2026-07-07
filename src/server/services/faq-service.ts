import { FaqRepository } from "@/server/repositories/faq-repository";

export class FaqService {
  constructor(private readonly repository = new FaqRepository()) {}

  async getPanelData() {
    const [faqItems, knowledgeDocuments] = await Promise.all([
      this.repository.listFaqItems(),
      this.repository.listKnowledgeDocuments()
    ]);

    return {
      faqItems: faqItems.length
        ? faqItems
        : [
            {
              id: "mock-faq",
              category: "Matricula",
              question: "Como funciona a matricula no EAD?",
              answer: "A IA deve explicar o fluxo geral e transferir quando houver aceite comercial.",
              priority: 10,
              active: true,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ],
      knowledgeDocuments: knowledgeDocuments.length
        ? knowledgeDocuments
        : [
            {
              id: "mock-doc",
              title: "Regras comerciais base",
              category: "Politicas",
              content: "Documento de apoio para respostas seguras e consulta da IA.",
              active: true,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ]
    };
  }
}
