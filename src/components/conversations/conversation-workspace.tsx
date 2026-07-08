"use client";

import { useEffect, useRef, useState } from "react";
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
  const [search, setSearch] = useState("");
  const selectedConversationIdRef = useRef(initialDetail?.id ?? initialItems[0]?.id ?? null);

  useEffect(() => {
    setItems(initialItems);
    setDetail(initialDetail);
    selectedConversationIdRef.current = initialDetail?.id ?? initialItems[0]?.id ?? null;
  }, [initialDetail, initialItems]);

  async function refreshWorkspace(selectedConversationId?: string) {
    const conversationId = selectedConversationId ?? selectedConversationIdRef.current ?? detail?.id ?? items[0]?.id;
    const url = conversationId ? `/api/conversations?conversationId=${conversationId}` : "/api/conversations";

    try {
      const response = await fetch(url, {
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
      selectedConversationIdRef.current = nextDetail?.id ?? nextItems[0]?.id ?? null;
    } catch {
      // silent polling failure to avoid noisy UI
    }
  }

  useEffect(() => {
    const syncWorkspace = () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      void refreshWorkspace();
    };

    const interval = window.setInterval(syncWorkspace, 2500);
    window.addEventListener("focus", syncWorkspace);
    document.addEventListener("visibilitychange", syncWorkspace);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", syncWorkspace);
      document.removeEventListener("visibilitychange", syncWorkspace);
    };
  }, [detail?.id, items.length]);

  async function handleSelectConversation(conversationId: string) {
    selectedConversationIdRef.current = conversationId;
    router.push(`/conversas?conversation=${conversationId}`);
    await refreshWorkspace(conversationId);
  }

  const filteredItems = items.filter((item) => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return true;
    }

    return [item.name, item.lastMessage, item.operator, item.status, ...item.tags]
      .join(" ")
      .toLowerCase()
      .includes(term);
  });

  return (
    <div className="grid min-h-0 gap-4 xl:grid-cols-[380px_minmax(0,1fr)] 2xl:grid-cols-[420px_minmax(0,1fr)]">
      <ConversationList
        items={filteredItems}
        selectedId={detail?.id}
        search={search}
        onSearchChange={setSearch}
        onSelectConversation={handleSelectConversation}
      />
      <ConversationPanel conversation={detail} onRefresh={() => refreshWorkspace()} />
    </div>
  );
}
