import Link from "next/link";
import { Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ConversationListItem } from "@/types/domain";

export function ConversationList({
  items,
  selectedId
}: {
  items: ConversationListItem[];
  selectedId?: string;
}) {
  return (
    <Card className="p-0">
      <div className="border-b p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input className="pl-10" placeholder="Pesquisar conversas..." />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone="blue">Todos</Badge>
          <Badge>IA ativa</Badge>
          <Badge>Sem resposta</Badge>
          <Badge tone="orange">Transferidos</Badge>
        </div>
      </div>

      <ScrollArea className="h-[680px]">
        <div className="space-y-2 p-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/conversas?conversation=${item.id}`}
              className={`flex w-full items-start gap-3 rounded-[24px] border px-3 py-3 text-left transition hover:border-slate-200 hover:bg-slate-50 ${
                selectedId === item.id ? "border-blue-200 bg-blue-50/60" : "border-transparent"
              }`}
            >
              <Avatar fallback={item.name.slice(0, 2).toUpperCase()} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                  <span className="text-xs text-slate-400">{item.time}</span>
                </div>
                <p className="mt-1 truncate text-sm text-slate-500">{item.lastMessage}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge tone="slate">{item.status}</Badge>
                  <Badge tone="green">{item.operator}</Badge>
                  {item.tags.map((tag) => (
                    <Badge key={tag} tone="blue">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              {item.unreadCount > 0 ? (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-700 px-2 text-xs font-semibold text-white">
                  {item.unreadCount}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
