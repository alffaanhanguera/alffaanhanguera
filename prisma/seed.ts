import { PrismaClient, UserRole, UserStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("acesso@2026", 12);

  await prisma.permission.createMany({
    data: [
      { code: "dashboard:view", name: "Visualizar dashboard", description: "Acessa métricas e gráficos" },
      { code: "conversation:manage", name: "Gerenciar conversas", description: "Atende e transfere conversas" },
      { code: "settings:manage", name: "Gerenciar configurações", description: "Altera integrações e IA" },
      { code: "audit:view", name: "Visualizar auditoria", description: "Acessa trilha de auditoria" }
    ],
    skipDuplicates: true
  });

  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [{ email: "admin@alffaeducacao.com" }, { email: "admin@alffaeducacao.com.br" }]
    }
  });

  const admin = existingAdmin
    ? await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          name: "Administrador",
          email: "admin@alffaeducacao.com.br",
          passwordHash,
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE
        }
      })
    : await prisma.user.create({
        data: {
          name: "Administrador",
          email: "admin@alffaeducacao.com.br",
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
      assistantName: "Juliana",
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
