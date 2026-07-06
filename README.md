# ALFFA CRM IA WhatsApp

CRM comercial profissional para captacao de matriculas Anhanguera com IA, WhatsApp via Z-API, JWT proprio, Prisma e Supabase PostgreSQL.

## Stack

- Next.js 16
- TypeScript
- TailwindCSS
- Shadcn UI base
- React Hook Form + Zod
- Prisma
- Supabase PostgreSQL
- JWT proprio + bcrypt
- OpenAI
- Z-API

## Modulos

- Dashboard
- Conversas
- Leads
- Operadores
- IA
- Cursos
- Ofertas EAD
- Beneficios
- FAQ
- Empresas Conveniadas
- Configuracoes
- Usuarios
- Permissoes
- Logs
- Auditoria
- Login
- Perfil

## Arquitetura

- `src/app`: rotas, telas, metadata, manifest e endpoints
- `src/components`: UI compartilhada, layout e componentes de dominio
- `src/server/repositories`: acesso a dados via Prisma
- `src/server/services`: regras de aplicacao e casos de uso
- `src/server/dtos`: validacoes de entrada
- `src/server/ai`: cliente OpenAI e regras comerciais
- `src/server/zapi`: integracao com WhatsApp Z-API
- `src/lib`: autenticacao, seguranca, helpers e Prisma client
- `prisma`: schema e seed inicial

## Regras de negocio implementadas

- IA consulta base de conhecimento antes de responder
- Uma pergunta por vez
- Memoria e contexto de conversa
- Coleta inicial restrita a nome, CPF, data de nascimento e e-mail
- Oferta automatica apenas para EAD cadastrado
- Presencial e semipresencial sempre seguem para operador
- Aceite do EAD tambem transfere para operador
- Valores presenciais e semipresenciais nunca sao automaticos

## Variaveis obrigatorias

Preencher obrigatoriamente:

- `OPENAI_API_KEY`
- `ZAPI_INSTANCE_ID`
- `ZAPI_INSTANCE_TOKEN`
- `SUPABASE_DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `DOMAIN_URL`

Variaveis adicionais suportadas:

- `ZAPI_CLIENT_TOKEN`
- `ZAPI_BASE_URL`
- `ZAPI_WEBHOOK_SECRET`

## Primeiros passos

1. Instale dependencias com `npm install`
2. Copie `.env.example` para `.env`
3. Ajuste as variaveis
4. Gere o client Prisma com `npx prisma generate`
5. Rode as migrations com `npx prisma migrate dev`
6. Popule a base com `npm run db:seed`
7. Inicie com `npm run dev`

## Login inicial

- E-mail: `admin@alffaeducacao.com`
- Senha: `Admin@123`

## Seguranca

- JWT access token e refresh token
- Cookies `httpOnly`
- Rate limiting no middleware
- Sanitizacao de texto
- Validacoes Zod
- Repository pattern
- Service layer
- Estrutura preparada para auditoria e logs

## PWA e SEO

- `manifest.ts`
- `robots.ts`
- `sitemap.ts`
- favicon a partir do `logo.jpeg`

## Revisao final recomendada

- Conferir conexao com Supabase
- Validar webhook da Z-API em ambiente publico
- Revisar prompts e politicas da OpenAI
- Rodar `npm run build`
- Validar permissoes por perfil
