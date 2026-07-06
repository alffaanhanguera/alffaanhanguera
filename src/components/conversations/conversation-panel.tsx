import { Paperclip, Phone, SendHorizontal, Smile, UserPlus, Video } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

const mockMessages = [
  { id: "1", author: "Maria", text: "Quero saber sobre Administracao EAD.", inbound: true, time: "09:12" },
  { id: "2", author: "IA", text: "Claro! Em qual cidade voce pretende estudar?", inbound: false, time: "09:13" },
  { id: "3", author: "Maria", text: "Sao Paulo, zona leste.", inbound: true, time: "09:14" },
  { id: "4", author: "IA", text: "Perfeito. Essa seria sua primeira graduacao?", inbound: false, time: "09:14" }
];

export function ConversationPanel() {
  return (
    <Card className="flex h-[780px] flex-col overflow-hidden p-0">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar fallback="MS" />
          <div>
            <p className="font-semibold text-slate-900">Maria Silva Santos</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="status-dot bg-emerald-500" />
              <p className="text-xs text-slate-500">IA ativa · digitando em tempo real</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge tone="orange">EAD</Badge>
          <Badge tone="green">Operador: Juliana</Badge>
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
          {mockMessages.map((message) => (
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
          <Badge tone="blue">Lead qualificado</Badge>
          <Badge tone="slate">ENEM: nao informado</Badge>
          <Badge tone="slate">Empresa: nao informado</Badge>
          <Badge tone="orange">Resumo pronto para operador</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Smile className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input placeholder="Responder, enviar audio, anexos ou assumir a conversa..." />
          <Button variant="secondary">
            <SendHorizontal className="mr-2 h-4 w-4" />
            Enviar
          </Button>
        </div>
      </div>
    </Card>
  );
}
