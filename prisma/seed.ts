import { PrismaClient, UserRole, UserStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("Admin@123", 12);

  await prisma.permission.createMany({
    data: [
      { code: "dashboard:view", name: "Visualizar dashboard", description: "Acessa métricas e gráficos" },
      { code: "conversation:manage", name: "Gerenciar conversas", description: "Atende e transfere conversas" },
      { code: "settings:manage", name: "Gerenciar configurações", description: "Altera integrações e IA" },
      { code: "audit:view", name: "Visualizar auditoria", description: "Acessa trilha de auditoria" }
    ],
    skipDuplicates: true
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@alffaeducacao.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@alffaeducacao.com",
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE
    }
  });

  const permissions = await prisma.permission.findMany();

  await prisma.userPermission.createMany({
    data: permissions.map((permission) => ({
      userId: admin.id,
      permissionId: permission.id
    })),
    skipDuplicates: true
  });

  const administrationCourse = await prisma.course.upsert({
    where: { code: "ADM001" },
    update: {},
    create: {
      code: "ADM001",
      name: "Administracao",
      type: "Bacharelado",
      durationSemesters: 8,
      hasPresential: true,
      hasSemipresential: true,
      hasEad: true,
      hasMatutino: true,
      hasNoturno: true,
      hasFlexibleHours: true,
      autoOfferMode: true
    }
  });

  await prisma.offer.upsert({
    where: { id: "offer_adm_ead_default" },
    update: {},
    create: {
      id: "offer_adm_ead_default",
      courseId: administrationCourse.id,
      monthlyPrice: "109.00",
      enrollmentFee: "109.00",
      firstMonthlyDueLabel: "Proximo mes da campanha vigente",
      durationLabel: "8 semestres",
      notes: "Oferta padrao do EAD 100% Online"
    }
  });

  await prisma.benefitRule.createMany({
    data: [
      { code: "ENEM", title: "ENEM", description: "Registrar ENEM nos ultimos 10 anos. Nao calcular bolsa." },
      { code: "COMPANY", title: "Convenio empresa", description: "Registrar empresa e possivel convenio." },
      { code: "TRANSFER", title: "Transferencia", description: "Registrar historico academico para operador." },
      { code: "SECOND_DEGREE", title: "Segunda graduacao", description: "Registrar conclusao previa." }
    ],
    skipDuplicates: true
  });

  await prisma.aiSetting.upsert({
    where: { id: "default_ai_setting" },
    update: {},
    create: {
      id: "default_ai_setting",
      organizationName: "Alffa Educacao",
      assistantName: "Joao",
      systemPrompt: "Atue como consultor comercial da Anhanguera. Nunca invente respostas, sempre consulte a base e faca uma pergunta por vez.",
      transferPrompt: "Transfira para operador quando houver modalidade presencial, semipresencial, aceite EAD ou necessidade manual."
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
