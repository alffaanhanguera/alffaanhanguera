import { ConversationRepository } from "@/server/repositories/conversation-repository";

export class ConversationService {
  constructor(private readonly repository = new ConversationRepository()) {}

  async listForInbox() {
    const items = await this.repository.list();

    if (items.length === 0) {
      return [
        {
          id: "mock-1",
          name: "Maria Silva Santos",
          avatar: "",
          lastMessage: "Quero saber sobre Administracao EAD.",
          time: "09:14",
          unreadCount: 3,
          status: "OPEN",
          operator: "Fila IA",
          tags: ["ead", "enem"]
        },
        {
          id: "mock-2",
          name: "Lucas Pereira",
          avatar: "",
          lastMessage: "Tenho interesse em Direito presencial.",
          time: "08:50",
          unreadCount: 1,
          status: "TRANSFERRED",
          operator: "Juliana Rocha",
          tags: ["presencial"]
        }
      ];
    }

    return items.map((conversation) => ({
      id: conversation.id,
      name: conversation.lead.fullName,
      avatar: "",
      lastMessage: conversation.messages[0]?.content ?? "Sem mensagens ainda",
      time: new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(
        conversation.lastMessageAt ?? conversation.updatedAt
      ),
      unreadCount: conversation.unreadCount,
      status: conversation.status,
      operator: conversation.assignedOperator?.name ?? "Fila IA",
      tags: conversation.tags
    }));
  }
}
