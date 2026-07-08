import { ConversationStatus, LeadStatus, Modality } from "@prisma/client";
import { formatCurrency, sanitizeDigits } from "@/lib/utils";
import { ConversationRepository } from "@/server/repositories/conversation-repository";
import { CourseRepository } from "@/server/repositories/course-repository";

const ASSISTANT_NAME = "Juliana";

type WorkflowStage =
  | "ask_name"
  | "ask_course"
  | "ask_city"
  | "ask_region"
  | "ask_enem"
  | "ask_clt"
  | "ask_company"
  | "ask_modality"
  | "confirm_ead"
  | "collect_full_name"
  | "collect_cpf"
  | "collect_birth_date"
  | "collect_email"
  | "ead_offer_sent"
  | "ask_shift"
  | "completed";

type WorkflowState = {
  stage: WorkflowStage;
  firstName?: string;
  cityRequiresRegion?: boolean;
  enemAnswered?: boolean;
  worksClt?: boolean;
  companyAsked?: boolean;
  selectedModality?: Modality;
  simulationDelivered?: boolean;
  transferred?: boolean;
};

type ChatbotFollowUp = {
  delayMs?: number;
  content: string;
};

type ChatbotReply = {
  answer?: string;
  shouldTransfer: boolean;
  followUps?: ChatbotFollowUp[];
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function parseYesNo(message: string) {
  const normalized = normalizeText(message);

  if (/^(sim|s|isso|claro|ok|pode|yes)\b/.test(normalized)) {
    return true;
  }

  if (/^(nao|não|n|negativo)\b/.test(normalized)) {
    return false;
  }

  return null;
}

function parseModality(message: string) {
  const normalized = normalizeText(message);

  if (normalized.includes("semi") || normalized.includes("cme")) {
    return Modality.SEMIPRESENTIAL;
  }

  if (normalized.includes("ead") || normalized.includes("online")) {
    return Modality.EAD;
  }

  if (normalized.includes("presencial")) {
    return Modality.PRESENTIAL;
  }

  return null;
}

function parseShift(message: string) {
  const normalized = normalizeText(message);

  if (normalized.includes("diurno") || normalized.includes("manha") || normalized.includes("manhã")) {
    return "Diurno";
  }

  if (normalized.includes("noturno") || normalized.includes("noite")) {
    return "Noturno";
  }

  return null;
}

function parseBirthDate(message: string) {
  const digits = message.replace(/\D/g, "");
  let day = "";
  let month = "";
  let year = "";

  if (digits.length === 8) {
    day = digits.slice(0, 2);
    month = digits.slice(2, 4);
    year = digits.slice(4, 8);
  } else {
    const basicMatch = message.match(/(\d{2})[\/.\-\s](\d{2})[\/.\-\s](\d{4})/);

    if (basicMatch) {
      [, day, month, year] = basicMatch;
    } else {
      const monthMap: Record<string, string> = {
        janeiro: "01",
        fevereiro: "02",
        marco: "03",
        abril: "04",
        maio: "05",
        junho: "06",
        julho: "07",
        agosto: "08",
        setembro: "09",
        outubro: "10",
        novembro: "11",
        dezembro: "12"
      };

      const normalized = normalizeText(message);
      const longMatch = normalized.match(/(\d{1,2})\s+de\s+([a-z]+)\s+de\s+(\d{4})/);

      if (!longMatch) {
        return null;
      }

      day = longMatch[1].padStart(2, "0");
      month = monthMap[longMatch[2]] ?? "";
      year = longMatch[3];
    }
  }

  if (!day || !month || !year) {
    return null;
  }

  const date = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseEmail(message: string) {
  const match = message.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match?.[0] ?? null;
}

function isRestartRequest(message: string) {
  const normalized = normalizeText(message);

  return [
    "reiniciar",
    "reinicia",
    "reinicio",
    "reiniciar fluxo",
    "reiniciar atendimento",
    "recomecar",
    "recomecar",
    "recomeçar",
    "comecar de novo",
    "comecar de novo",
    "iniciar novamente"
  ].includes(normalized);
}

function isSaoPauloCity(message: string) {
  const normalized = normalizeText(message);
  return normalized === "sao paulo" || normalized === "sp" || normalized === "sao paulo sp";
}

function formatModalityLabel(modality: Modality) {
  if (modality === Modality.EAD) {
    return "EAD";
  }

  if (modality === Modality.SEMIPRESENTIAL) {
    return "Semi-Presencial";
  }

  return "Presencial";
}

function buildWelcomeMessage() {
  return [
    "Olá! 😊",
    "Seja bem-vindo(a) à Anhanguera.",
    "",
    `Meu nome é ${ASSISTANT_NAME} e vou te ajudar com sua matricula.`,
    "",
    "Qual seu nome por gentileza?"
  ].join("\n");
}

function buildModalitiesMessage(firstName: string, courseName: string, modalities: Modality[]) {
  if (modalities.length === 1) {
    return `${firstName} 😊, a faculdade de ${courseName} nós ofertamos na modalidade: ${formatModalityLabel(modalities[0])}. Funciona para você?`;
  }

  return `${firstName} 😊, a faculdade de ${courseName} nós ofertamos nas modalidades: ${modalities
    .map(formatModalityLabel)
    .join(", ")}, qual funciona melhor para você?`;
}

function buildEadExplanation() {
  return [
    "No EAD você estuda com flexibilidade, acessa o conteúdo online e realiza as avaliações presenciais quando necessário no polo.",
    "",
    "Funciona para você o EAD?"
  ].join("\n");
}

function buildNonEadExplanation(modality: Modality, firstName: string) {
  const explanation =
    modality === Modality.PRESENTIAL
      ? "No presencial você frequenta aulas na unidade, com rotina fixa e acompanhamento direto."
      : "No semi-presencial você combina estudos online com encontros presenciais na unidade.";

  return `${explanation}\n\n${firstName} 😊! Os turnos disponiveis são:\n\nDiurno: 8h às 11h\nNoturno: 19 às 22h\n\nQual funciona melhor para você?`;
}

function buildSilentSummaryStatus(modality: Modality | null | undefined) {
  return modality === Modality.EAD ? "Pronto para continuidade manual do EAD" : "Pronto para simulacao manual";
}

function formatBirthDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function extractFirstName(message: string) {
  const sanitized = message.replace(/[^\p{L}\s'-]/gu, " ").replace(/\s+/g, " ").trim();

  if (!sanitized) {
    return null;
  }

  const [firstName] = sanitized.split(" ");
  return firstName || null;
}

export class CommercialFlowService {
  constructor(
    private readonly conversations = new ConversationRepository(),
    private readonly courses = new CourseRepository()
  ) {}

  private getWorkflowState(notes?: string | null): WorkflowState {
    if (!notes) {
      return { stage: "ask_name" };
    }

    try {
      const parsed = JSON.parse(notes) as WorkflowState;
      return parsed.stage ? parsed : { stage: "ask_name" };
    } catch {
      return { stage: "ask_name" };
    }
  }

  private async persistState(params: {
    leadId: string;
    state: WorkflowState;
    leadData?: Record<string, unknown>;
    benefitSummary?: string | null;
    conversationId?: string;
    conversationData?: Record<string, unknown>;
  }) {
    await this.conversations.updateLead(params.leadId, {
      ...(params.leadData ?? {}),
      notes: JSON.stringify(params.state),
      benefitSummary: params.benefitSummary
    });

    if (params.conversationId && params.conversationData) {
      await this.conversations.updateConversation(params.conversationId, params.conversationData);
    }
  }

  private buildSummary(conversation: Awaited<ReturnType<ConversationRepository["getRecentHistoryByPhone"]>>) {
    if (!conversation) {
      return "Resumo indisponível.";
    }

    const { lead } = conversation;
    const state = this.getWorkflowState(lead.notes);

    return [
      `Nome: ${lead.fullName || state.firstName || "Nao informado"}`,
      `Curso: ${lead.desiredCourse?.name || "Nao informado"}`,
      `Cidade: ${lead.city || "Nao informado"}`,
      `Regiao: ${lead.region || "Nao informado"}`,
      `ENEM: ${lead.hasEnem === null || lead.hasEnem === undefined ? "Nao informado" : lead.hasEnem ? "Sim" : "Nao"}`,
      `CLT: ${state.worksClt === undefined ? "Nao informado" : state.worksClt ? "Sim" : "Nao"}`,
      `Empresa: ${lead.companyName || "Nao informado"}`,
      `Modalidade: ${lead.desiredModality ? formatModalityLabel(lead.desiredModality) : "Nao informado"}`,
      `Turno: ${lead.desiredShift || "Nao informado"}`,
      `CPF: ${lead.cpf || "Nao informado"}`,
      `Nascimento: ${lead.birthDate ? formatBirthDate(lead.birthDate) : "Nao informado"}`,
      `E-mail: ${lead.email || "Nao informado"}`,
      `Status: ${buildSilentSummaryStatus(lead.desiredModality)}`
    ].join("\n");
  }

  private async transferToOperator(params: {
    conversationId: string;
    leadId: string;
    state: WorkflowState;
    summary: string;
    visibleMessage?: string;
  }): Promise<ChatbotReply> {
    await this.persistState({
      leadId: params.leadId,
      state: { ...params.state, stage: "completed", transferred: true },
      leadData: {
        status: LeadStatus.READY_FOR_OPERATOR
      },
      benefitSummary: params.summary,
      conversationId: params.conversationId,
      conversationData: {
        aiEnabled: false,
        aiSummary: params.summary,
        status: ConversationStatus.TRANSFERRED
      }
    });

    return {
      answer: params.visibleMessage,
      shouldTransfer: true
    };
  }

  private buildOfferMessage(course: NonNullable<Awaited<ReturnType<CourseRepository["findById"]>>>) {
    const offer = course.offers[0];

    if (!offer) {
      return [
        "Vou realizar uma simulação e já te encaminho as informações.",
        "",
        "No momento a oferta deste curso ainda será validada manualmente com um consultor."
      ].join("\n");
    }

    return [
      `🧡 ${course.name.toUpperCase()} – ${course.type.toUpperCase()} 🧡`,
      `*🎓 Modalidade:* EAD`,
      `*⏳ Horário:* Flexível`,
      `*📅 Duração:* ${offer.durationLabel}`,
      `*💰 Mensalidade:* De 299,00 por ${formatCurrency(offer.monthlyPrice.toNumber())}*`,
      `*💳 Matrícula:* ${formatCurrency(offer.enrollmentFee.toNumber())}*`,
      "",
      `📅 A primeira mensalidade será paga somente no mês de ${offer.firstMonthlyDueLabel}.`,
      "",
      "ℹ️ _Existe apenas o reajuste anual pelo ipca, conforme legislação vigente._",
      "",
      "Gostaria de prosseguir com a matrícula?"
    ].join("\n");
  }

  async generateReply(params: { phone: string; latestMessage: string }): Promise<ChatbotReply> {
    const conversation = await this.conversations.getRecentHistoryByPhone(params.phone, 30);

    if (!conversation) {
      return {
        answer: buildWelcomeMessage(),
        shouldTransfer: false
      };
    }

    const { lead } = conversation;
    const state = this.getWorkflowState(lead.notes);
    const message = params.latestMessage.trim();

    if (isRestartRequest(message)) {
      await this.persistState({
        leadId: lead.id,
        state: { stage: "ask_name" },
        leadData: {
          fullName: params.phone,
          city: null,
          region: null,
          desiredCourseId: null,
          desiredModality: null,
          desiredShift: null,
          hasEnem: null,
          companyName: null,
          benefitSummary: null,
          cpf: null,
          email: null,
          birthDate: null,
          status: LeadStatus.QUALIFYING
        },
        conversationId: conversation.id,
        conversationData: {
          aiEnabled: true,
          aiSummary: null,
          status: ConversationStatus.OPEN,
          unreadCount: 0
        }
      });

      return {
        answer: buildWelcomeMessage(),
        shouldTransfer: false
      };
    }

    if (!lead.notes && conversation.messages.length <= 1) {
      await this.persistState({
        leadId: lead.id,
        state: { stage: "ask_name" },
        leadData: {
          status: LeadStatus.QUALIFYING
        }
      });

      return {
        answer: buildWelcomeMessage(),
        shouldTransfer: false
      };
    }

    if (state.stage === "ask_name") {
      const firstName = extractFirstName(message) ?? "Aluno";

      await this.persistState({
        leadId: lead.id,
        state: { stage: "ask_course", firstName },
        leadData: {
          fullName: firstName
        }
      });

      return {
        answer: "Qual faculdade você deseja fazer?",
        shouldTransfer: false
      };
    }

    if (state.stage === "ask_course") {
      const course = await this.courses.findByMessage(message);

      if (!course) {
        return {
          answer: "Qual faculdade você deseja fazer?",
          shouldTransfer: false
        };
      }

      await this.persistState({
        leadId: lead.id,
        state: { ...state, stage: "ask_city" },
        leadData: {
          desiredCourseId: course.id
        }
      });

      return {
        answer: "Em qual cidade você reside?",
        shouldTransfer: false
      };
    }

    const course = lead.desiredCourseId ? await this.courses.findById(lead.desiredCourseId) : null;

    if (!course) {
      return {
        answer: "Qual faculdade você deseja fazer?",
        shouldTransfer: false
      };
    }

    if (state.stage === "ask_city") {
      const cityRequiresRegion = isSaoPauloCity(message);

      await this.persistState({
        leadId: lead.id,
        state: {
          ...state,
          stage: cityRequiresRegion ? "ask_region" : "ask_enem",
          cityRequiresRegion
        },
        leadData: {
          city: message
        }
      });

      return {
        answer: cityRequiresRegion ? "Me informe a região por gentileza?" : "Você realizou o ENEM nos últimos 10 anos?",
        shouldTransfer: false
      };
    }

    if (state.stage === "ask_region") {
      await this.persistState({
        leadId: lead.id,
        state: { ...state, stage: "ask_enem" },
        leadData: {
          region: message
        }
      });

      return {
        answer: "Você realizou o ENEM nos últimos 10 anos?",
        shouldTransfer: false
      };
    }

    if (state.stage === "ask_enem") {
      await this.persistState({
        leadId: lead.id,
        state: { ...state, stage: "ask_clt", enemAnswered: true },
        leadData: {
          hasEnem: parseYesNo(message)
        }
      });

      return {
        answer: "Você trabalha no regime CLT atualmente?",
        shouldTransfer: false
      };
    }

    if (state.stage === "ask_clt") {
      const worksClt = parseYesNo(message) === true;

      await this.persistState({
        leadId: lead.id,
        state: {
          ...state,
          stage: worksClt ? "ask_company" : "ask_modality",
          worksClt
        }
      });

      if (worksClt) {
        return {
          answer:
            "Pergunto por que possuímos convênio com diversas empresas e vou verificar se você possui direito ao beneficio.\n\nEm qual empresa você trabalha?",
          shouldTransfer: false
        };
      }

      return {
        answer: "Ok, sem problemas! 😊",
        shouldTransfer: false,
        followUps: [
          {
            content: buildModalitiesMessage(state.firstName ?? "Aluno", course.name, this.courses.getAvailableModalities(course))
          }
        ]
      };
    }

    if (state.stage === "ask_company") {
      await this.persistState({
        leadId: lead.id,
        state: { ...state, stage: "ask_modality", companyAsked: true },
        leadData: {
          companyName: message
        },
        benefitSummary: `Possivel convenio empresa: ${message}`
      });

      return {
        answer: buildModalitiesMessage(state.firstName ?? "Aluno", course.name, this.courses.getAvailableModalities(course)),
        shouldTransfer: false
      };
    }

    if (state.stage === "ask_modality") {
      const availableModalities = this.courses.getAvailableModalities(course);
      const singleAvailableModality = availableModalities.length === 1 ? availableModalities[0] : null;
      const yesNoAnswer = parseYesNo(message);
      const selectedModality =
        parseModality(message) ??
        (singleAvailableModality && yesNoAnswer === true ? singleAvailableModality : null);

      if (!selectedModality || !availableModalities.includes(selectedModality)) {
        return {
          answer: buildModalitiesMessage(state.firstName ?? "Aluno", course.name, availableModalities),
          shouldTransfer: false
        };
      }

      await this.persistState({
        leadId: lead.id,
        state: {
          ...state,
          stage: selectedModality === Modality.EAD ? "confirm_ead" : "ask_shift",
          selectedModality
        },
        leadData: {
          desiredModality: selectedModality
        }
      });

      if (selectedModality === Modality.EAD) {
        return {
          answer: buildEadExplanation(),
          shouldTransfer: false
        };
      }

      return {
        answer: buildNonEadExplanation(selectedModality, state.firstName ?? "Aluno"),
        shouldTransfer: false
      };
    }

    if (state.stage === "confirm_ead") {
      if (parseYesNo(message) !== true) {
        return {
          answer: "Funciona para você o EAD?",
          shouldTransfer: false
        };
      }

      await this.persistState({
        leadId: lead.id,
        state: { ...state, stage: "collect_full_name" }
      });

      return {
        answer: "Perfeito, para preparar sua simulação eu preciso apenas de algumas informações:\n\nMe informa o seu *NOME COMPLETO*",
        shouldTransfer: false
      };
    }

    if (state.stage === "collect_full_name") {
      await this.persistState({
        leadId: lead.id,
        state: { ...state, stage: "collect_cpf" },
        leadData: {
          fullName: message
        }
      });

      return {
        answer: `Anotado, seu nome completo é *${message}* , agora me informe o seu CPF:`,
        shouldTransfer: false
      };
    }

    if (state.stage === "collect_cpf") {
      const cpf = sanitizeDigits(message);

      if (cpf.length !== 11) {
        return {
          answer: "Me informe o seu CPF por gentileza?",
          shouldTransfer: false
        };
      }

      await this.persistState({
        leadId: lead.id,
        state: { ...state, stage: "collect_birth_date" },
        leadData: {
          cpf
        }
      });

      return {
        answer: "Cadastrei o CPF informado no sistema, qual é sua data de nascimento?",
        shouldTransfer: false
      };
    }

    if (state.stage === "collect_birth_date") {
      const birthDate = parseBirthDate(message);

      if (!birthDate) {
        return {
          answer: "Qual é sua data de nascimento?",
          shouldTransfer: false
        };
      }

      await this.persistState({
        leadId: lead.id,
        state: { ...state, stage: "collect_email" },
        leadData: {
          birthDate
        }
      });

      return {
        answer: `Sua data de nascimento é ${formatBirthDate(birthDate)}, já estamos quase finalizando 😊\n\nMe informe seu e-mail por gentileza?`,
        shouldTransfer: false
      };
    }

    if (state.stage === "collect_email") {
      const email = parseEmail(message);

      if (!email) {
        return {
          answer: "Me informe seu e-mail por gentileza?",
          shouldTransfer: false
        };
      }

      await this.persistState({
        leadId: lead.id,
        state: { ...state, stage: "ead_offer_sent", simulationDelivered: true },
        leadData: {
          email
        }
      });

      return {
        answer: "Vou realizar uma simulação e já te encaminho as informações.",
        shouldTransfer: false,
        followUps: [
          {
            delayMs: 30000,
            content: this.buildOfferMessage(course)
          }
        ]
      };
    }

    if (state.stage === "ead_offer_sent") {
      const summary = this.buildSummary(await this.conversations.getRecentHistoryByPhone(params.phone, 30));
      return this.transferToOperator({
        conversationId: conversation.id,
        leadId: lead.id,
        state,
        summary
      });
    }

    if (state.stage === "ask_shift") {
      const shift = parseShift(message) ?? message;

      await this.persistState({
        leadId: lead.id,
        state: { ...state, stage: "completed" },
        leadData: {
          desiredShift: shift
        }
      });

      const summary = this.buildSummary(await this.conversations.getRecentHistoryByPhone(params.phone, 30));
      return this.transferToOperator({
        conversationId: conversation.id,
        leadId: lead.id,
        state,
        summary,
        visibleMessage: "Vou realizar uma simulação e já te encaminho as informações. 😊"
      });
    }

    return {
      shouldTransfer: false
    };
  }
}
