import { ConversationWorkspace } from "@/components/conversations/conversation-workspace";
import { PageShell } from "@/components/shared/page-shell";
import { ConversationService } from "@/server/services/conversation-service";

export default async function ConversasPage({
  searchParams
}: {
  searchParams?: Promise<{ conversation?: string }>;
}) {
  const service = new ConversationService();
  const items = await service.listForInbox();
  const params = searchParams ? await searchParams : undefined;
  const selectedConversationId = params?.conversation ?? items[0]?.id;
  const detail = await service.getConversationDetail(selectedConversationId);

  return (
    <PageShell
      title="Central de conversas"
      description="Inbox operacional semelhante ao WhatsApp Web, com filtros, historico persistente, atribuicao de operador e suporte ao Chatbot Juliana."
    >
      <ConversationWorkspace initialItems={items} initialDetail={detail} />
    </PageShell>
  );
}
