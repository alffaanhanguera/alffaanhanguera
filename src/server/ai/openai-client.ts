import { env } from "@/config/env";
import { knowledgeBaseSummary } from "@/server/knowledge/knowledge-base";

function shouldTransferToOperator(message: string) {
  const normalized = message.toLowerCase();

  return [
    "presencial",
    "semipresencial",
    "boleto",
    "pix",
    "cartao",
    "contrato",
    "ra",
    "vestibular",
    "pagfacil",
    "pag fácil"
  ].some((keyword) => normalized.includes(keyword));
}

export class OpenAIClient {
  async generateReply(input: { leadName: string; history: string[]; latestMessage: string }) {
    if (shouldTransferToOperator(input.latestMessage)) {
      return {
        answer: "Vou encaminhar seu atendimento para um consultor continuar com as informacoes corretas e os proximos passos.",
        source: "guardrail",
        shouldTransfer: true
      };
    }

    if (!env.OPENAI_API_KEY) {
      return {
        answer: `Base configurada em modo seguro. Ultima mensagem recebida de ${input.leadName}: "${input.latestMessage}".`,
        source: "fallback",
        shouldTransfer: false
      };
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL,
        input: [
          {
            role: "system",
            content: `Voce atende matriculas da Anhanguera. Regras: ${knowledgeBaseSummary.rules.join(" ")}`
          },
          {
            role: "user",
            content: `Historico: ${input.history.join(" | ")}. Ultima mensagem: ${input.latestMessage}`
          }
        ]
      })
    });

    if (!response.ok) {
      return {
        answer: "Nao foi possivel consultar a IA no momento. Encaminhando para operador.",
        source: "error",
        shouldTransfer: true
      };
    }

    const payload = await response.json();
    const answer = payload.output?.[0]?.content?.[0]?.text ?? "Encaminhando para operador.";

    return { answer, source: "openai", shouldTransfer: false };
  }
}
