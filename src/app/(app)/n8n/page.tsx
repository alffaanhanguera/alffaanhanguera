import { N8NWorkspace } from "@/components/n8n/n8n-workspace";
import { getCurrentSession } from "@/lib/auth/session";
import { aiBusinessRules } from "@/server/ai/business-rules";
import { CourseService } from "@/server/services/course-service";
import { DashboardService } from "@/server/services/dashboard-service";
import { SettingsService } from "@/server/services/settings-service";

export default async function N8NPage() {
  const [dashboard, settings, session, courses] = await Promise.all([
    new DashboardService().getSummary(),
    new SettingsService().getPanelData(),
    getCurrentSession(),
    new CourseService().getN8NCatalog()
  ]);

  const agentName = settings.ai.assistantName || "Cris";
  const userName = session?.user.name ?? "Administrador";
  const userInitial = userName.slice(0, 1).toUpperCase();

  return (
    <N8NWorkspace
      userName={userName}
      userInitial={userInitial}
      agents={[
        {
          id: "agent-main",
          name: agentName,
          status: "Ativo",
          description:
            "Nome: consultor comercial Alffa. Atua como atendente humano no WhatsApp, faz a qualificacao inicial, responde com contexto e prepara a transferencia.",
          meta: `${dashboard.metrics[3]?.value ?? "0"} cursos vendidos  •  Z-API conectada`
        }
      ]}
      courses={courses}
      openAiItems={[
        {
          id: "openai-main",
          name: agentName,
          model: "gpt-4o-mini",
          description: settings.ai.systemPrompt,
          rulesCount: aiBusinessRules.length
        }
      ]}
      flowNodes={[
        {
          id: "node-1",
          key: "START",
          title: "Entrada WhatsApp",
          description: "Ola! Eu sou o consultor da Alffa. Qual curso voce deseja fazer para iniciarmos seu atendimento?",
          footer: "Mensagem #1"
        },
        {
          id: "node-2",
          key: "ASK_CITY",
          title: "Cidade e regiao",
          description: "Validar cidade do lead e registrar a regiao preferida antes de seguir com modalidade e turno.",
          footer: "Mensagem #2"
        },
        {
          id: "node-3",
          key: "ASK_PROFILE",
          title: "Qualificacao",
          description: "Coletar apenas dados permitidos no fluxo inicial e confirmar se e primeira graduacao, transferencia ou segunda graduacao.",
          footer: "Mensagem #3"
        },
        {
          id: "node-4",
          key: "HANDOVER",
          title: "Resumo e operador",
          description: "Gerar resumo da conversa, salvar historico e transferir para operador quando houver necessidade comercial ou aceite EAD.",
          footer: "Mensagem #4"
        }
      ]}
    />
  );
}
