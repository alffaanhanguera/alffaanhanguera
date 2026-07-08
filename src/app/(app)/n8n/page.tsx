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

  const agentName = "Juliana";
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
            "Nome: Juliana. Atua como chatbot comercial no WhatsApp, faz a qualificacao inicial, consulta a base de conhecimento e prepara a transferencia para operador nas etapas manuais.",
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
          title: "Abertura",
          description: "Ola! Tudo bem? Meu nome e Juliana, consultora educacional da Anhanguera. Qual curso voce deseja fazer?",
          footer: "Mensagem #1"
        },
        {
          id: "node-2",
          key: "COURSE_CITY",
          title: "Curso, cidade e regiao",
          description: "Identificar o curso desejado, acolher perguntas sobre valor sem pular etapas e registrar cidade e regiao antes da proposta.",
          footer: "Mensagem #2"
        },
        {
          id: "node-3",
          key: "ACADEMIC_PROFILE",
          title: "Diagnostico academico",
          description: "Confirmar se e primeira graduacao, transferencia ou segunda graduacao, validar ensino medio, ENEM e empresa para beneficios.",
          footer: "Mensagem #3"
        },
        {
          id: "node-4",
          key: "MODALITY",
          title: "Modalidade e turno",
          description: "Consultar a base de cursos, apresentar somente modalidades disponiveis e registrar turno quando for presencial ou semipresencial.",
          footer: "Mensagem #4"
        },
        {
          id: "node-5",
          key: "LEAD_DATA",
          title: "Coleta dos 4 dados",
          description: "Solicitar apenas nome completo, CPF, data de nascimento e e-mail para deixar o atendimento pronto para proposta ou oferta.",
          footer: "Mensagem #5"
        },
        {
          id: "node-6",
          key: "EAD_OFFER",
          title: "Oferta EAD automatica",
          description: "Enviar oferta automatica somente quando o curso tiver EAD cadastrado com valor vigente, sem aplicar bolsa adicional no fluxo.",
          footer: "Mensagem #6"
        },
        {
          id: "node-7",
          key: "HANDOVER",
          title: "Resumo e transferencia",
          description: "Gerar resumo estruturado para o operador e encerrar a atuacao do Chatbot Juliana quando houver etapa manual, presencial, semipresencial ou aceite EAD.",
          footer: "Mensagem #7"
        }
      ]}
    />
  );
}
