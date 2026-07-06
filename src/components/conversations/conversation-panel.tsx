import { ConversationComposer } from "@/components/conversations/conversation-composer";
import type { ConversationDetail } from "@/types/domain";
import { Phone, UserPlus, Video } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ConversationPanel({ conversation }: { conversation: ConversationDetail | null }) {
  if (!conversation) {
    return (
      <Card className="flex h-[780px] items-center justify-center p-10 text-center">
        <div>
          <p className="text-lg font-semibold text-slate-900">Nenhuma conversa selecionada</p>
          <p className="mt-2 text-sm text-slate-500">Assim que um lead interagir pelo WhatsApp, o historico aparecera aqui.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex h-[780px] flex-col overflow-hidden p-0">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar fallback={conversation.leadName.slice(0, 2).toUpperCase()} />
          <div>
            <p className="font-semibold text-slate-900">{conversation.leadName}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className={`status-dot ${conversation.aiEnabled ? "bg-emerald-500" : "bg-orange-500"}`} />
              <p className="text-xs text-slate-500">{conversation.aiEnabled ? "IA ativa" : "Em fila humana"} · {conversation.phone}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge tone="orange">{conversation.modality}</Badge>
          <Badge tone="green">Operador: {conversation.operator}</Badge>
          <Button variant="outline" size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Transferir
          </Button>
          <Button variant="ghost" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(228,236,246,0.9))] px-5 py-6">
        <div className="space-y-4">
          {conversation.messages.map((message) => (
            <div key={message.id} className={`flex ${message.inbound ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[80%] rounded-[24px] px-4 py-3 text-sm shadow-sm ${
                  message.inbound ? "bg-white text-slate-900" : "bg-blue-900 text-white"
                }`}
              >
                <p>{message.text}</p>
                <p className={`mt-2 text-[11px] ${message.inbound ? "text-slate-400" : "text-blue-100"}`}>{message.time}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t bg-white px-5 py-4">
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge tone="blue">{conversation.status}</Badge>
          <Badge tone="slate">Turno: {conversation.shift}</Badge>
          <Badge tone="slate">{conversation.benefitSummary}</Badge>
          {conversation.aiSummary ? <Badge tone="orange">Resumo pronto para operador</Badge> : null}
        </div>

        <ConversationComposer conversationId={conversation.id} />
      </div>
    </Card>
  );
}
