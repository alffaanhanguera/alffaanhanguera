import { MessageDirection, Modality } from "@prisma/client";
import { ZApiClient } from "@/server/zapi/zapi-client";
import { ConversationRepository } from "@/server/repositories/conversation-repository";
import { IntegrationLogRepository } from "@/server/repositories/integration-log-repository";
import type { ConversationDetail } from "@/types/domain";

export class ConversationService {
  constructor(
    private readonly repository = new ConversationRepository(),
    private readonly zapi = new ZApiClient(),
    private readonly integrationLogs = new IntegrationLogRepository()
  ) {}

  async listForInbox() {
    const items = await this.repository.list();

    if (items.length === 0) {
      return [];
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

  async getConversationDetail(conversationId?: string): Promise<ConversationDetail | null> {
    const inbox = await this.repository.list();
    const target =
      (conversationId ? await this.repository.getById(conversationId) : null) ??
      (inbox[0] ? await this.repository.getById(inbox[0].id) : null);

    if (!target) {
      return null;
    }

    return {
      id: target.id,
      leadName: target.lead.fullName,
      phone: target.lead.phone,
      status: target.status,
      aiEnabled: target.aiEnabled,
      aiSummary: target.aiSummary,
      operator: target.assignedOperator?.name ?? "Fila IA",
      modality:
        target.lead.desiredModality === Modality.EAD
          ? "EAD 100% Online"
          : target.lead.desiredModality === Modality.SEMIPRESENTIAL
            ? "Semipresencial"
            : target.lead.desiredModality === Modality.PRESENTIAL
              ? "Presencial"
              : "Nao definido",
      shift: target.lead.desiredShift ?? "Nao definido",
      benefitSummary: target.lead.benefitSummary ?? "Nenhum beneficio identificado",
      messages: target.messages.map((message) => ({
        id: message.id,
        text: message.content,
        inbound: message.direction === MessageDirection.INBOUND,
        time: new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(message.createdAt),
        type: message.type
      }))
    };
  }

  async sendManualReply(params: { conversationId: string; content: string }) {
    const conversation = await this.repository.getById(params.conversationId);

    if (!conversation) {
      throw new Error("Conversa nao encontrada.");
    }

    const delivery = await this.zapi.sendTextMessage(conversation.lead.phone, params.content);

    if (!delivery.delivered) {
      await this.integrationLogs.create({
        provider: "z-api",
        endpoint: "manual-reply",
        statusCode: delivery.status,
        message: "Falha ao enviar mensagem manual para o WhatsApp.",
        payload: {
          conversationId: conversation.id,
          phone: conversation.lead.phone
        },
        response: delivery
      });

      throw new Error("A Z-API nao confirmou o envio da mensagem.");
    }

    const storedMessage = await this.repository.createOutboundManualMessage({
      conversationId: conversation.id,
      content: params.content,
      metadata: {
        source: "operator-panel"
      }
    });

    await this.integrationLogs.create({
      provider: "z-api",
      endpoint: "manual-reply",
      statusCode: delivery.status,
      message: "Mensagem manual enviada pelo operador.",
      payload: {
        conversationId: conversation.id,
        phone: conversation.lead.phone,
        storedMessageId: storedMessage.id
      },
      response: delivery
    });

    return {
      delivered: true,
      messageId: storedMessage.id
    };
  }

  async sendManualMediaReply(params: {
    conversationId: string;
    fileName: string;
    mimeType: string;
    dataUrl: string;
    caption?: string;
  }) {
    const conversation = await this.repository.getById(params.conversationId);

    if (!conversation) {
      throw new Error("Conversa nao encontrada.");
    }

    const messageType = params.mimeType.startsWith("image/")
      ? "IMAGE"
      : params.mimeType.startsWith("audio/")
        ? "AUDIO"
        : params.mimeType.startsWith("video/")
          ? "VIDEO"
          : params.mimeType.includes("pdf")
            ? "PDF"
            : "DOCUMENT";

    const delivery =
      messageType === "IMAGE"
        ? await this.zapi.sendImageMessage(conversation.lead.phone, params.dataUrl, params.caption)
        : messageType === "AUDIO"
          ? await this.zapi.sendAudioMessage(conversation.lead.phone, params.dataUrl)
          : messageType === "VIDEO"
            ? await this.zapi.sendVideoMessage(conversation.lead.phone, params.dataUrl, params.caption)
            : await this.zapi.sendDocumentMessage(conversation.lead.phone, params.dataUrl, params.fileName, params.caption);

    if (!delivery.delivered) {
      await this.integrationLogs.create({
        provider: "z-api",
        endpoint: "manual-media-reply",
        statusCode: delivery.status,
        message: "Falha ao enviar midia manual para o WhatsApp.",
        payload: {
          conversationId: conversation.id,
          phone: conversation.lead.phone,
          fileName: params.fileName,
          mimeType: params.mimeType
        },
        response: delivery
      });

      throw new Error("A Z-API nao confirmou o envio da midia.");
    }

    const storedMessage = await this.repository.createOutboundManualMessage({
      conversationId: conversation.id,
      content: params.caption?.trim() || params.fileName,
      type: messageType,
      mediaUrl: params.fileName,
      metadata: {
        source: "operator-panel",
        fileName: params.fileName,
        mimeType: params.mimeType
      }
    });

    await this.integrationLogs.create({
      provider: "z-api",
      endpoint: "manual-media-reply",
      statusCode: delivery.status,
      message: "Midia manual enviada pelo operador.",
      payload: {
        conversationId: conversation.id,
        phone: conversation.lead.phone,
        storedMessageId: storedMessage.id,
        fileName: params.fileName,
        mimeType: params.mimeType
      },
      response: delivery
    });

    return {
      delivered: true,
      messageId: storedMessage.id,
      type: messageType
    };
  }
}
