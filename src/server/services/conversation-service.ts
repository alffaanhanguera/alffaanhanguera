import { MessageDirection, Modality } from "@prisma/client";
import {
  extractPipelineStageId,
  getStageLabel,
  mergePipelineTag,
  normalizeTags,
  stripPipelineTags,
  type LeadPipelineStageId
} from "@/lib/crm";
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

  private mapLegacyLeadStatus(status: string | null | undefined): LeadPipelineStageId {
    if (status === "ENROLLED") {
      return "completed-enrollment";
    }

    if (status === "IN_NEGOTIATION") {
      return "operator-service";
    }

    if (status === "READY_FOR_OPERATOR") {
      return "waiting-operator";
    }

    if (status === "QUALIFYING") {
      return "ai-service";
    }

    if (status === "LOST") {
      return "closed";
    }

    return "new-lead";
  }

  async listForInbox() {
    const items = await this.repository.list();

    if (items.length === 0) {
      return [];
    }

    return items.map((conversation) => {
      const pipelineStageId = extractPipelineStageId(conversation.tags) ?? this.mapLegacyLeadStatus(conversation.lead.status);

      return {
        id: conversation.id,
        name: conversation.lead.fullName,
        avatar: "",
        lastMessage: conversation.messages[0]?.content ?? "Sem mensagens ainda",
        time: new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(
          conversation.lastMessageAt ?? conversation.updatedAt
        ),
        unreadCount: conversation.unreadCount,
        status: getStageLabel(pipelineStageId),
        operator: conversation.assignedOperator?.name ?? "Fila IA",
        tags: stripPipelineTags(conversation.tags)
      };
    });
  }

  async getConversationDetail(conversationId?: string): Promise<ConversationDetail | null> {
    const inbox = await this.repository.list();
    const target =
      (conversationId ? await this.repository.getById(conversationId) : null) ??
      (inbox[0] ? await this.repository.getById(inbox[0].id) : null);

    if (!target) {
      return null;
    }

    const pipelineStageId = extractPipelineStageId(target.tags) ?? this.mapLegacyLeadStatus(target.lead.status);

    return {
      id: target.id,
      leadName: target.lead.fullName,
      phone: target.lead.phone,
      status: getStageLabel(pipelineStageId),
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
      tags: stripPipelineTags(target.tags),
      leadNotes: target.lead.notes ?? null,
      pipelineStageId,
      messages: target.messages.map((message) => {
        const metadata =
          typeof message.metadata === "object" && message.metadata ? (message.metadata as Record<string, unknown>) : undefined;
        const deliveryStatus = typeof metadata?.deliveryStatus === "string" ? metadata.deliveryStatus : null;
        const readAt = typeof metadata?.readAt === "string" ? metadata.readAt : null;

        let deliveryLabel: string | null = null;

        if (message.direction === MessageDirection.OUTBOUND) {
          if (deliveryStatus === "READ") {
            deliveryLabel = readAt
              ? `Visualizada às ${new Intl.DateTimeFormat("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit"
                }).format(new Date(readAt))}`
              : "Visualizada";
          } else if (deliveryStatus === "DELIVERED") {
            deliveryLabel = "Entregue";
          } else {
            deliveryLabel = "Enviada";
          }
        }

        return {
          id: message.id,
          text: message.content,
          inbound: message.direction === MessageDirection.INBOUND,
          time: new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(message.createdAt),
          type: message.type,
          mediaName: message.mediaUrl,
          deliveryStatus,
          deliveryLabel
        };
      })
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
      externalMessageId: "messageId" in delivery ? delivery.messageId : undefined,
      metadata: {
        source: "operator-panel",
        deliveryStatus: "SENT"
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
      externalMessageId: "messageId" in delivery ? delivery.messageId : undefined,
      metadata: {
        source: "operator-panel",
        fileName: params.fileName,
        mimeType: params.mimeType,
        deliveryStatus: "SENT"
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

  async toggleAiControl(conversationId: string, aiEnabled: boolean) {
    const conversation = await this.repository.getById(conversationId);

    if (!conversation) {
      throw new Error("Conversa nao encontrada.");
    }

    await this.repository.updateConversation(conversationId, {
      aiEnabled,
      status: aiEnabled ? "OPEN" : "TRANSFERRED",
      unreadCount: 0
    });

    await this.integrationLogs.create({
      provider: "crm",
      endpoint: "conversation-toggle-ai",
      statusCode: 200,
      message: aiEnabled ? "Conversa devolvida ao chatbot." : "Conversa transferida para humano.",
      payload: {
        conversationId,
        aiEnabled
      }
    });

    return {
      success: true,
      aiEnabled
    };
  }

  async updateConversationMetadata(params: {
    conversationId: string;
    tags?: string[];
    leadNotes?: string | null;
    pipelineStageId?: string;
  }) {
    const conversation = await this.repository.getById(params.conversationId);

    if (!conversation) {
      throw new Error("Conversa nao encontrada.");
    }

    const nextTags = normalizeTags(params.tags ?? stripPipelineTags(conversation.tags));
    const stageId = (params.pipelineStageId ?? extractPipelineStageId(conversation.tags) ?? this.mapLegacyLeadStatus(conversation.lead.status)) as LeadPipelineStageId;

    await this.repository.updateConversation(conversation.id, {
      tags: mergePipelineTag(nextTags, stageId)
    });

    if (params.leadNotes !== undefined) {
      await this.repository.updateLead(conversation.leadId, {
        notes: params.leadNotes || null
      });
    }

    return this.getConversationDetail(conversation.id);
  }

  async updateLeadPipelineStage(leadId: string, pipelineStageId: LeadPipelineStageId) {
    const conversation = (await this.repository.getByLeadId(leadId)) ?? (await this.repository.ensureConversationForLead(leadId));

    if (!conversation) {
      throw new Error("Conversa do lead nao encontrada.");
    }

    await this.repository.updateConversation(conversation.id, {
      tags: mergePipelineTag(conversation.tags, pipelineStageId)
    });

    return {
      success: true,
      conversationId: conversation.id
    };
  }

  async updateOutboundDeliveryStatus(params: {
    externalMessageId: string;
    status: string;
    readAt?: Date | null;
    deliveredAt?: Date | null;
  }) {
    await this.repository.updateOutboundMessageStatus(params);

    return {
      success: true
    };
  }
}
