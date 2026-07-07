import { ConversationStatus, EnrollmentIntent, LeadStatus, Modality } from "@prisma/client";
import { formatCurrency, sanitizeDigits } from "@/lib/utils";
import { ConversationRepository } from "@/server/repositories/conversation-repository";
import { CourseRepository } from "@/server/repositories/course-repository";

const ASSISTANT_NAME = "Juliana";

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

function isGreeting(message: string) {
  const normalized = normalizeText(message);

  return /^(oi|ola|olá|bom dia|boa tarde|boa noite|opa|e ai|e aí)\b/.test(normalized);
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

function buildModalitiesQuestion(courseName: string, modalities: Modality[]) {
  if (modalities.length === 1 && modalities[0] === Modality.EAD) {
    return "Esse curso esta disponivel no EAD 100% Online. Voce estuda com horario flexivel e realiza as avaliacoes presenciais no polo, com agendamento previo.\nFunciona para voce?";
  }

  if (modalities.length === 1 && modalities[0] === Modality.PRESENTIAL) {
    return `Atualmente ${courseName} e ofertado apenas na modalidade presencial, conforme as diretrizes aplicaveis ao curso.\nEssa modalidade presencial funcionaria para voce?`;
  }

  const labels = modalities.map(formatModalityLabel).join(", ");
  return `Para ${courseName}, temos opcoes ${labels}. Qual funciona melhor para sua rotina?`;
}

function buildModalityExplanation(modality: Modality) {
  if (modality === Modality.EAD) {
    return "No EAD 100% Online, voce estuda com horario flexivel e realiza apenas as avaliacoes presenciais no campus ou polo, com agendamento previo.";
  }

  if (modality === Modality.SEMIPRESENTIAL) {
    return "No Semipresencial, voce combina estudos online com encontros presenciais no polo ou campus, conforme a grade do curso.";
  }

  return "No Presencial, voce frequenta aulas no campus em dias definidos, de acordo com o turno e a grade do curso.";
}

function buildGreeting(courseSuggestions: string[]) {
  const suggestions = courseSuggestions.length
    ? `\nAlguns cursos que posso te ajudar agora: ${courseSuggestions.join(", ")}.`
    : "";

  return `Ola! Tudo bem?\n\nMeu nome e ${ASSISTANT_NAME}, consultora educacional da Anhanguera.\nQual curso voce deseja fazer?${suggestions}`;
}

function hasPriceQuestion(message: string) {
  return /(valor|preco|preço|quanto custa|mensalidade)/i.test(message);
}

function buildDataCollectionPrompt() {
  return "Perfeito! Para deixar seu atendimento pronto e preparar a proposta da sua matricula, me envie por gentileza: nome completo, CPF, data de nascimento e e-mail.";
}

function buildMissingDataPrompt(missingFields: string[]) {
  return `Perfeito! Para eu concluir seu atendimento, me envie por gentileza: ${missingFields.join(", ")}.`;
}

function extractLeadFields(message: string) {
  const cpfMatch = message.match(/\b\d{3}\D?\d{3}\D?\d{3}\D?\d{2}\b/);
  const birthDateMatch = message.match(/\b\d{2}\/\d{2}\/\d{4}\b/);
  const emailMatch = message.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);

  let remaining = message;

  if (cpfMatch) {
    remaining = remaining.replace(cpfMatch[0], " ");
  }

  if (birthDateMatch) {
    remaining = remaining.replace(birthDateMatch[0], " ");
  }

  if (emailMatch) {
    remaining = remaining.replace(emailMatch[0], " ");
  }

  remaining = remaining
    .replace(/nome completo|nome|cpf|data de nascimento|nascimento|e-mail|email/gi, " ")
    .replace(/[:;\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const cpf = cpfMatch ? sanitizeDigits(cpfMatch[0]) : "";
  const birthDate = birthDateMatch ? parseBirthDate(birthDateMatch[0]) : null;
  const email = emailMatch?.[0] ?? null;
  const fullName = remaining.length >= 5 && /[a-z]/i.test(remaining) ? remaining : null;

  return {
    cpf: cpf.length === 11 ? cpf : null,
    birthDate,
    email,
    fullName
  };
}

function getMissingLeadFields(lead: {
  fullName: string;
  phone: string;
  cpf: string | null;
  birthDate: Date | null;
  email: string | null;
}) {
  const missingFields: string[] = [];

  if (lead.fullName === lead.phone) {
    missingFields.push("nome completo");
  }

  if (!lead.cpf) {
    missingFields.push("CPF");
  }

  if (!lead.birthDate) {
    missingFields.push("data de nascimento");
  }

  if (!lead.email) {
    missingFields.push("e-mail");
  }

  return missingFields;
}

function buildObjectionReply(message: string) {
  const normalized = normalizeText(message);

  if (normalized.includes("esta caro") || normalized.includes("ta caro") || normalized.includes("tá caro")) {
    return "Entendo. Por isso verificamos beneficios como ENEM, empresa, transferencia ou segunda graduacao. Posso conferir se existe alguma condicao melhor para o seu perfil.";
  }

  if (normalized.includes("vou pensar")) {
    return "Tudo bem. So para eu te ajudar melhor: sua duvida maior e sobre valor, horario ou modalidade?";
  }

  if (normalized.includes("tem desconto")) {
    return "Podemos verificar. Alguns beneficios dependem do seu perfil, como ENEM, empresa, transferencia ou segunda graduacao.";
  }

  if (normalized.includes("mec")) {
    return "Sim, os cursos seguem as regras do ensino superior. Posso verificar as informacoes do curso especifico para voce.";
  }

  if (normalized.includes("vestibular")) {
    return "Depende da forma de ingresso. Em alguns casos, como ENEM, pode haver possibilidade de aproveitamento. O operador confirma no fechamento.";
  }

  return null;
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
    const courseSuggestions = await this.courses.listNames(6);

    if (!conversation) {
      return {
        answer: buildGreeting(courseSuggestions),
        shouldTransfer: false
      };
    }

    const { lead } = conversation;
    const state = this.getWorkflowState(lead.notes);
    const message = params.latestMessage.trim();
    const normalized = normalizeText(message);
    const objectionReply = buildObjectionReply(message);

    if (!lead.desiredCourseId) {
      if (isGreeting(message)) {
        return {
          answer: buildGreeting(courseSuggestions),
          shouldTransfer: false
        };
      }

      const detectedCourse = await this.courses.findByMessage(message);

      if (!detectedCourse) {
        return {
          answer: hasPriceQuestion(message)
            ? "Claro! Vou te passar certinho. So preciso confirmar primeiro qual curso voce deseja fazer."
            : courseSuggestions.length
              ? `Perfeito! Qual curso voce deseja fazer?\nPosso te ajudar, por exemplo, com: ${courseSuggestions.join(", ")}.`
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
        answer: hasPriceQuestion(message)
          ? "Claro! Eu verifico a melhor condicao para voce. O valor pode variar conforme curso, cidade, modalidade e beneficios disponiveis.\nPrimeiro, em qual cidade voce pretende estudar?"
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

    if (objectionReply) {
      return {
        answer: objectionReply,
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

      const availableModalities = this.courses.getAvailableModalities(course);
      return {
        answer: `Tudo bem. Vou seguir com as informacoes do curso para encontrar a melhor opcao para voce.\n${buildModalitiesQuestion(course.name, availableModalities)}`,
        shouldTransfer: false
      };
    }

    if (state.worksCurrently && !lead.companyName) {
      const availableModalities = this.courses.getAvailableModalities(course);

      await this.persistState({
        leadId: lead.id,
        state: { ...state, stage: "modality" },
        leadData: { companyName: message },
        benefitSummary: [lead.benefitSummary, `Possivel convenio empresa: ${message}`].filter(Boolean).join(" | ")
      });

      return {
        answer: `Show! Vou registrar essa informacao para verificar a melhor condicao disponivel para o seu perfil.\n${buildModalitiesQuestion(course.name, availableModalities)}`,
        shouldTransfer: false
      };
    }

    if (!lead.desiredModality) {
      const availableModalities = this.courses.getAvailableModalities(course);
      const requestedModality = parseModality(message) ?? state.requestedModality;

      if (!requestedModality) {
        return {
          answer: buildModalitiesQuestion(course.name, availableModalities),
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
          answer: `${buildModalityExplanation(Modality.EAD)}\n${buildDataCollectionPrompt()}`,
          shouldTransfer: false
        };
      }

      return {
        answer: `${buildModalityExplanation(requestedModality)}\nHoje funciona melhor para voce estudar de manha, a tarde ou a noite?`,
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
        answer: `Perfeito. Vou registrar o turno ${shift} para a proposta.\n${buildDataCollectionPrompt()}`,
        shouldTransfer: false
      };
    }

    const missingLeadFields = getMissingLeadFields(lead);

    if (missingLeadFields.length > 0) {
      const extractedFields = extractLeadFields(message);
      const leadData: Record<string, unknown> = {};

      if (lead.fullName === lead.phone && extractedFields.fullName) {
        leadData.fullName = extractedFields.fullName;
      }

      if (!lead.cpf && extractedFields.cpf) {
        leadData.cpf = extractedFields.cpf;
      }

      if (!lead.birthDate && extractedFields.birthDate) {
        leadData.birthDate = extractedFields.birthDate;
      }

      if (!lead.email && extractedFields.email) {
        leadData.email = extractedFields.email;
      }

      if (Object.keys(leadData).length > 0) {
        await this.persistState({
          leadId: lead.id,
          state: { ...state, stage: "ead_offer" },
          leadData
        });
      }

      const refreshedConversation = await this.conversations.getRecentHistoryByPhone(params.phone, 20);
      const refreshedLead = refreshedConversation?.lead ?? lead;
      const remainingFields = getMissingLeadFields(refreshedLead);

      if (remainingFields.length > 0) {
        return {
          answer: buildMissingDataPrompt(remainingFields),
          shouldTransfer: false
        };
      }

      if (refreshedLead.desiredModality === Modality.EAD && course.autoOfferMode && course.offers[0]) {
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

      const summary = this.buildSummary(refreshedConversation);
      return this.handover(
        conversation.id,
        lead.id,
        summary,
        refreshedLead.desiredModality === Modality.PRESENTIAL
          ? "Perfeito! Como o curso presencial pode variar conforme unidade, turno e beneficios disponiveis, vou deixar suas informacoes prontas para apresentar a melhor condicao para voce.\nVou encaminhar seu atendimento para um consultor finalizar a proposta com os valores corretos."
          : "Perfeito! Como essa modalidade pode variar conforme unidade e beneficios disponiveis, vou organizar suas informacoes para o consultor preparar a melhor condicao para voce.\nAguarde so um instante, vou encaminhar seu atendimento."
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
