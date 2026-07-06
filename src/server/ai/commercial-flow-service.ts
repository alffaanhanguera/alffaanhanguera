import { ConversationStatus, EnrollmentIntent, LeadStatus, Modality } from "@prisma/client";
import { formatCurrency, sanitizeDigits } from "@/lib/utils";
import { ConversationRepository } from "@/server/repositories/conversation-repository";
import { CourseRepository } from "@/server/repositories/course-repository";

type WorkflowStage =
  | "course"
  | "city"
  | "region"
  | "graduation"
  | "high_school"
  | "enem"
  | "work"
  | "company"
  | "modality"
  | "shift"
  | "full_name"
  | "cpf"
  | "birth_date"
  | "email"
  | "ead_offer"
  | "handover"
  | "completed";

type WorkflowState = {
  stage: WorkflowStage;
  highSchoolCompleted?: boolean;
  worksCurrently?: boolean;
  requestedModality?: Modality;
  transferred?: boolean;
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

function parseIntent(message: string) {
  const normalized = normalizeText(message);

  if (normalized.includes("ja tenho") || normalized.includes("já tenho") || normalized.includes("concluida")) {
    return EnrollmentIntent.SECOND_DEGREE;
  }

  if (normalized.includes("transfer") || normalized.includes("comecei") || normalized.includes("nao terminei") || normalized.includes("não terminei")) {
    return EnrollmentIntent.TRANSFER;
  }

  if (normalized.includes("primeira") || normalized === "sim") {
    return EnrollmentIntent.FIRST_DEGREE;
  }

  return null;
}

function parseModality(message: string) {
  const normalized = normalizeText(message);

  if (normalized.includes("semipresencial") || normalized.includes("cme")) {
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

  if (normalized.includes("manha") || normalized.includes("manhã") || normalized.includes("matut")) {
    return "Matutino";
  }

  if (normalized.includes("tarde") || normalized.includes("vespertino")) {
    return "Vespertino";
  }

  if (normalized.includes("noite") || normalized.includes("noturno")) {
    return "Noturno";
  }

  if (normalized.includes("flex")) {
    return "Horario Flexivel";
  }

  return null;
}

function parseBirthDate(message: string) {
  const match = message.match(/(\d{2})\/(\d{2})\/(\d{4})/);

  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  const date = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseEmail(message: string) {
  const match = message.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match?.[0] ?? null;
}

function formatModalityLabel(modality: Modality) {
  if (modality === Modality.EAD) {
    return "EAD 100% Online";
  }

  if (modality === Modality.SEMIPRESENTIAL) {
    return "Semipresencial";
  }

  return "Presencial";
}

export class CommercialFlowService {
  constructor(
    private readonly conversations = new ConversationRepository(),
    private readonly courses = new CourseRepository()
  ) {}

  private getWorkflowState(notes?: string | null): WorkflowState {
    if (!notes) {
      return { stage: "course" };
    }

    try {
      const parsed = JSON.parse(notes) as WorkflowState;
      return parsed.stage ? parsed : { stage: "course" };
    } catch {
      return { stage: "course" };
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

  private async handover(conversationId: string, leadId: string, summary: string, statusLabel: string) {
    await this.persistState({
      leadId,
      state: { stage: "completed", transferred: true },
      leadData: { status: LeadStatus.READY_FOR_OPERATOR },
      benefitSummary: summary,
      conversationId,
      conversationData: {
        aiEnabled: false,
        aiSummary: summary,
        status: ConversationStatus.TRANSFERRED
      }
    });

    return {
      answer: `${statusLabel}\n\nResumo para operador:\n${summary}`,
      shouldTransfer: true
    };
  }

  private buildSummary(conversation: Awaited<ReturnType<ConversationRepository["getRecentHistoryByPhone"]>>) {
    if (!conversation) {
      return "Resumo indisponivel.";
    }

    const { lead } = conversation;
    const state = this.getWorkflowState(lead.notes);

    return [
      `Nome completo: ${lead.fullName || "Nao informado"}`,
      `CPF: ${lead.cpf || "Nao informado"}`,
      `Data de nascimento: ${lead.birthDate ? new Intl.DateTimeFormat("pt-BR").format(lead.birthDate) : "Nao informado"}`,
      `E-mail: ${lead.email || "Nao informado"}`,
      `Curso: ${lead.desiredCourse?.name || "Nao informado"}`,
      `Tipo: ${lead.desiredCourse?.type || "Nao informado"}`,
      `Cidade: ${lead.city || "Nao informado"}`,
      `Regiao: ${lead.region || "Nao informado"}`,
      `Modalidade: ${lead.desiredModality ? formatModalityLabel(lead.desiredModality) : "Nao informado"}`,
      `Turno: ${lead.desiredShift || "Nao informado"}`,
      `Primeira graduacao: ${
        lead.enrollmentIntent === EnrollmentIntent.FIRST_DEGREE
          ? "Sim"
          : lead.enrollmentIntent === EnrollmentIntent.SECOND_DEGREE
            ? "Nao - segunda graduacao"
            : lead.enrollmentIntent === EnrollmentIntent.TRANSFER
              ? "Nao - transferencia"
              : "Nao informado"
      }`,
      `Ensino Medio: ${state.highSchoolCompleted === undefined ? "Nao informado" : state.highSchoolCompleted ? "Concluido" : "Pendente"}`,
      `ENEM: ${lead.hasEnem === undefined || lead.hasEnem === null ? "Nao informado" : lead.hasEnem ? "Sim" : "Nao"}`,
      `Empresa: ${lead.companyName || "Nao informado"}`,
      `Beneficio identificado: ${lead.benefitSummary || "Nao identificado"}`,
      `Status: Pronto para ${lead.desiredModality === Modality.EAD ? "finalizacao manual" : "envio de oferta manual"}`
    ].join("\n");
  }

  async generateReply(params: { phone: string; latestMessage: string }) {
    const conversation = await this.conversations.getRecentHistoryByPhone(params.phone, 20);

    if (!conversation) {
      return {
        answer: "Ola! Tudo bem?\n\nMeu nome e Joao, consultor educacional da Anhanguera.\nQual curso voce deseja fazer?",
        shouldTransfer: false
      };
    }

    const { lead } = conversation;
    const state = this.getWorkflowState(lead.notes);
    const message = params.latestMessage.trim();
    const normalized = normalizeText(message);

    if (!lead.desiredCourseId) {
      const detectedCourse = await this.courses.findByMessage(message);

      if (!detectedCourse) {
        return {
          answer: normalized.includes("valor")
            ? "Claro! Vou te passar certinho. So preciso confirmar primeiro qual curso voce deseja fazer."
            : "Perfeito! Qual curso voce deseja fazer?",
          shouldTransfer: false
        };
      }

      const requestedModality = parseModality(message) ?? state.requestedModality;
      await this.persistState({
        leadId: lead.id,
        state: { ...state, stage: "city", requestedModality },
        leadData: {
          desiredCourseId: detectedCourse.id,
          status: LeadStatus.QUALIFYING
        }
      });

      return {
        answer: normalized.includes("valor")
          ? "Claro! Eu verifico a melhor condicao para voce. O valor pode variar conforme cidade, modalidade e beneficios disponiveis.\nPrimeiro, em qual cidade voce pretende estudar?"
          : `Perfeito! Em qual cidade voce mora ou pretende estudar para ${detectedCourse.name}?`,
        shouldTransfer: false
      };
    }

    const course = await this.courses.findById(lead.desiredCourseId);

    if (!course) {
      return {
        answer: "Nao consegui localizar esse curso na base agora. Vou encaminhar para um consultor validar para voce.",
        shouldTransfer: true
      };
    }

    if (!lead.city) {
      await this.persistState({
        leadId: lead.id,
        state: { ...state, stage: "region" },
        leadData: { city: message }
      });

      return {
        answer: `Perfeito! Em qual regiao de ${message} fica melhor para voce?`,
        shouldTransfer: false
      };
    }

    if (!lead.region) {
      await this.persistState({
        leadId: lead.id,
        state: { ...state, stage: "graduation" },
        leadData: { region: message }
      });

      return {
        answer: "Essa seria sua primeira graduacao?",
        shouldTransfer: false
      };
    }

    if (!lead.enrollmentIntent) {
      const intent = parseIntent(message);

      if (!intent) {
        return {
          answer: "So para eu registrar certinho: essa seria sua primeira graduacao, segunda graduacao ou transferencia?",
          shouldTransfer: false
        };
      }

      const benefitSummary =
        intent === EnrollmentIntent.SECOND_DEGREE
          ? "Possivel beneficio de segunda graduacao"
          : intent === EnrollmentIntent.TRANSFER
            ? "Possivel transferencia"
            : null;

      await this.persistState({
        leadId: lead.id,
        state: { ...state, stage: "high_school" },
        leadData: {
          enrollmentIntent: intent
        },
        benefitSummary
      });

      if (intent === EnrollmentIntent.SECOND_DEGREE) {
        return {
          answer: "Perfeito! Voce pode ter direito a beneficio de segunda graduacao. Vou registrar essa informacao para a proposta.\nVoce ja concluiu o Ensino Medio?",
          shouldTransfer: false
        };
      }

      if (intent === EnrollmentIntent.TRANSFER) {
        return {
          answer: "Entendi. Nesse caso podemos verificar possibilidade de transferencia ou aproveitamento. Vou registrar para analise da proposta.\nVoce ja concluiu o Ensino Medio?",
          shouldTransfer: false
        };
      }

      return {
        answer: "Voce ja concluiu o Ensino Medio?",
        shouldTransfer: false
      };
    }

    if (state.highSchoolCompleted === undefined) {
      const yesNo = parseYesNo(message);

      if (yesNo === null) {
        return {
          answer: "So para eu registrar: voce ja concluiu o Ensino Medio?",
          shouldTransfer: false
        };
      }

      await this.persistState({
        leadId: lead.id,
        state: { ...state, stage: "enem", highSchoolCompleted: yesNo }
      });

      return {
        answer: "Voce realizou a prova do ENEM nos ultimos 10 anos?",
        shouldTransfer: false
      };
    }

    if (lead.hasEnem === null || lead.hasEnem === undefined) {
      const yesNo = parseYesNo(message);

      if (yesNo === null) {
        return {
          answer: "Voce realizou a prova do ENEM nos ultimos 10 anos?",
          shouldTransfer: false
        };
      }

      await this.persistState({
        leadId: lead.id,
        state: { ...state, stage: "work" },
        leadData: {
          hasEnem: yesNo
        },
        benefitSummary: yesNo
          ? [lead.benefitSummary, "ENEM identificado"].filter(Boolean).join(" | ")
          : lead.benefitSummary
      });

      return {
        answer: yesNo
          ? "Otimo! O ENEM pode ajudar na analise de beneficio. Depois vamos precisar de um print das suas notas pelo site do INEP, tudo bem?\nVoce trabalha atualmente?"
          : "Sem problemas. Vamos seguir verificando outras possibilidades para voce.\nVoce trabalha atualmente?",
        shouldTransfer: false
      };
    }

    if (state.worksCurrently === undefined) {
      const yesNo = parseYesNo(message);

      if (yesNo === null) {
        return {
          answer: "Voce trabalha atualmente?",
          shouldTransfer: false
        };
      }

      await this.persistState({
        leadId: lead.id,
        state: { ...state, stage: yesNo ? "company" : "modality", worksCurrently: yesNo }
      });

      if (yesNo) {
        return {
          answer: "Em qual empresa voce trabalha? Pergunto porque temos parceria com varias empresas e pode existir beneficio convenio.",
          shouldTransfer: false
        };
      }

      return {
        answer: "Tudo bem. Vou seguir com as informacoes do curso para encontrar a melhor opcao para voce.\nQual modalidade funciona melhor para sua rotina?",
        shouldTransfer: false
      };
    }

    if (state.worksCurrently && !lead.companyName) {
      await this.persistState({
        leadId: lead.id,
        state: { ...state, stage: "modality" },
        leadData: { companyName: message },
        benefitSummary: [lead.benefitSummary, `Possivel convenio empresa: ${message}`].filter(Boolean).join(" | ")
      });

      return {
        answer: "Show! Vou registrar essa informacao para verificar a melhor condicao disponivel para o seu perfil.\nAgora me diga: qual modalidade funciona melhor para sua rotina?",
        shouldTransfer: false
      };
    }

    if (!lead.desiredModality) {
      const availableModalities = this.courses.getAvailableModalities(course);
      const requestedModality = parseModality(message) ?? state.requestedModality;

      if (!requestedModality) {
        const labels = availableModalities.map(formatModalityLabel).join(", ");
        return {
          answer: `Para ${course.name}, temos opcoes ${labels}. Qual funciona melhor para sua rotina?`,
          shouldTransfer: false
        };
      }

      if (!availableModalities.includes(requestedModality)) {
        const labels = availableModalities.map(formatModalityLabel);
        const fallback =
          course.name.toLowerCase().includes("direito") && availableModalities.includes(Modality.PRESENTIAL)
            ? "Atualmente Direito e ofertado apenas na modalidade presencial, conforme as diretrizes aplicaveis ao curso.\nEssa modalidade presencial funcionaria para voce?"
            : `No momento, ${course.name} nao esta disponivel em ${formatModalityLabel(requestedModality)}. Podemos verificar ${labels.join(" ou ")}. Qual delas faria mais sentido para voce?`;

        await this.persistState({
          leadId: lead.id,
          state: { ...state, requestedModality }
        });

        return {
          answer: fallback,
          shouldTransfer: false
        };
      }

      const nextStage = requestedModality === Modality.EAD ? "full_name" : "shift";
      await this.persistState({
        leadId: lead.id,
        state: { ...state, stage: nextStage, requestedModality },
        leadData: { desiredModality: requestedModality }
      });

      if (requestedModality === Modality.EAD) {
        return {
          answer: "No EAD 100% Online, voce estuda com horario flexivel e realiza apenas as avaliacoes presenciais no campus ou polo, com agendamento previo.\nPerfeito! Agora me envie seu nome completo.",
          shouldTransfer: false
        };
      }

      return {
        answer: "Hoje funciona melhor para voce estudar de manha, a tarde ou a noite?",
        shouldTransfer: false
      };
    }

    if (lead.desiredModality !== Modality.EAD && !lead.desiredShift) {
      const shift = parseShift(message);

      if (!shift) {
        return {
          answer: "Hoje funciona melhor para voce estudar de manha, a tarde ou a noite?",
          shouldTransfer: false
        };
      }

      await this.persistState({
        leadId: lead.id,
        state: { ...state, stage: "full_name" },
        leadData: { desiredShift: shift }
      });

      return {
        answer: `Perfeito. Vou registrar o turno ${shift} para a proposta.\nAgora me envie seu nome completo.`,
        shouldTransfer: false
      };
    }

    if (!lead.cpf && lead.fullName === lead.phone) {
      await this.persistState({
        leadId: lead.id,
        state: { ...state, stage: "cpf" },
        leadData: { fullName: message }
      });

      return {
        answer: "Perfeito! Agora me envie seu CPF.",
        shouldTransfer: false
      };
    }

    if (!lead.cpf) {
      const cpf = sanitizeDigits(message);

      if (cpf.length !== 11) {
        return {
          answer: "Pode me enviar o CPF com 11 digitos, por favor?",
          shouldTransfer: false
        };
      }

      await this.persistState({
        leadId: lead.id,
        state: { ...state, stage: "birth_date" },
        leadData: { cpf }
      });

      return {
        answer: "Perfeito! Agora me informe sua data de nascimento no formato DD/MM/AAAA.",
        shouldTransfer: false
      };
    }

    if (!lead.birthDate) {
      const birthDate = parseBirthDate(message);

      if (!birthDate) {
        return {
          answer: "Pode me informar sua data de nascimento no formato DD/MM/AAAA?",
          shouldTransfer: false
        };
      }

      await this.persistState({
        leadId: lead.id,
        state: { ...state, stage: "email" },
        leadData: { birthDate }
      });

      return {
        answer: "Perfeito! Agora me envie seu e-mail.",
        shouldTransfer: false
      };
    }

    if (!lead.email) {
      const email = parseEmail(message);

      if (!email) {
        return {
          answer: "Pode me enviar um e-mail valido, por favor?",
          shouldTransfer: false
        };
      }

      await this.persistState({
        leadId: lead.id,
        state: { ...state, stage: "ead_offer" },
        leadData: { email }
      });

      if (lead.desiredModality === Modality.EAD && course.autoOfferMode && course.offers[0]) {
        const offer = course.offers[0];
        return {
          answer:
            `Vou consultar a oferta disponivel para o curso.\n\n` +
            `${course.name} EAD 100% Online - ${course.type}\n` +
            `Modalidade: Online\n` +
            `Horario: Livre\n` +
            `Duracao: ${offer.durationLabel}\n` +
            `Mensalidade: ${formatCurrency(offer.monthlyPrice.toNumber())}\n` +
            `Matricula: ${formatCurrency(offer.enrollmentFee.toNumber())}\n` +
            `A 1a mensalidade fica para ${offer.firstMonthlyDueLabel}.\n` +
            `As mensalidades possuem reajuste anual previsto em contrato, que normalmente varia entre 1% e 6%.\n` +
            `Podemos seguir com sua matricula?`,
          shouldTransfer: false
        };
      }

      const summary = this.buildSummary(await this.conversations.getRecentHistoryByPhone(params.phone, 20));
      return this.handover(
        conversation.id,
        lead.id,
        summary,
        lead.desiredModality === Modality.PRESENTIAL
          ? "Perfeito! Vou encaminhar seu atendimento para um consultor finalizar a proposta com os valores corretos."
          : "Perfeito! Vou organizar suas informacoes para o consultor preparar a melhor condicao para voce."
      );
    }

    if (lead.desiredModality === Modality.EAD) {
      const accepted = parseYesNo(message);

      if (accepted === true) {
        const updatedConversation = await this.conversations.getRecentHistoryByPhone(params.phone, 20);
        const summary = this.buildSummary(updatedConversation);
        return this.handover(
          conversation.id,
          lead.id,
          summary,
          "Perfeito! Vou encaminhar seu atendimento para finalizar sua inscricao e gerar a forma de pagamento.\nUm consultor vai seguir com os proximos passos: pagamento, vestibular quando necessario, aceite de contrato e liberacao do RA."
        );
      }

      if (normalized.includes("desconto") || normalized.includes("bolsa")) {
        return {
          answer: "No EAD 100% Online, a oferta vigente ja esta em condicao promocional. Por isso, essa modalidade segue com o valor da campanha, sem aplicacao de bolsa adicional.\nPosso seguir com essa condicao para voce?",
          shouldTransfer: false
        };
      }
    }

    return {
      answer: "Perfeito! Vou seguir com seu atendimento sem repetir o que voce ja me informou. Se preferir, posso encaminhar agora para um consultor concluir os proximos passos.",
      shouldTransfer: false
    };
  }
}
