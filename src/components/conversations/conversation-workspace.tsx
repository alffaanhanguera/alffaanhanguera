"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ConversationList } from "@/components/conversations/conversation-list";
import { ConversationPanel } from "@/components/conversations/conversation-panel";
import type { ConversationDetail, ConversationListItem } from "@/types/domain";

type ConversationWorkspaceProps = {
  initialItems: ConversationListItem[];
  initialDetail: ConversationDetail | null;
};

export function ConversationWorkspace({ initialItems, initialDetail }: ConversationWorkspaceProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [detail, setDetail] = useState(initialDetail);

  async function refreshWorkspace(selectedConversationId?: string) {
    const conversationId = selectedConversationId ?? detail?.id ?? items[0]?.id;

    if (!conversationId) {
      return;
    }

    try {
      const response = await fetch(`/api/conversations?conversationId=${conversationId}`, {
        cache: "no-store"
      });

      if (!response.ok) {
        return;
      }

      const payload = await response.json();
      const nextItems = payload.data?.items ?? [];
      const nextDetail = payload.data?.detail ?? null;
      setItems(nextItems);
      setDetail(nextDetail);
    } catch {
      // silent polling failure to avoid noisy UI
    }
  }

  useEffect(() => {
    const interval = window.setInterval(() => {
      void refreshWorkspace();
    }, 4000);

    return () => window.clearInterval(interval);
  }, [detail?.id, items.length]);

  async function handleSelectConversation(conversationId: string) {
    router.push(`/conversas?conversation=${conversationId}`);
    await refreshWorkspace(conversationId);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
      <ConversationList items={items} selectedId={detail?.id} onSelectConversation={handleSelectConversation} />
      <ConversationPanel conversation={detail} onRefresh={() => refreshWorkspace()} />
    </div>
  );
}
