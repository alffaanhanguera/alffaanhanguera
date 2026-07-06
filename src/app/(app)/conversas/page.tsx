import { ConversationList } from "@/components/conversations/conversation-list";
import { ConversationPanel } from "@/components/conversations/conversation-panel";
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
      description="Inbox operacional semelhante ao WhatsApp Web, com filtros, historico persistente, atribuicao de operador e suporte para IA em tempo real."
    >
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <ConversationList items={items} selectedId={detail?.id} />
        <ConversationPanel conversation={detail} />
      </div>
    </PageShell>
  );
}
