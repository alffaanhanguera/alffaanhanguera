import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  SUPABASE_DATABASE_URL: z.string().min(1).default("postgresql://user:password@localhost:5432/crm"),
  DIRECT_URL: z.string().min(1).default("postgresql://user:password@localhost:5432/crm"),
  JWT_SECRET: z.string().min(32).default("change-me-change-me-change-me-123"),
  JWT_REFRESH_SECRET: z.string().min(32).default("change-me-refresh-change-me-123"),
  OPENAI_API_KEY: z.string().default(""),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  DOMAIN_URL: z.string().url().default("http://localhost:3000"),
  ZAPI_INSTANCE_ID: z.string().default(""),
  ZAPI_INSTANCE_TOKEN: z.string().default(""),
  ZAPI_CLIENT_TOKEN: z.string().default(""),
  ZAPI_BASE_URL: z.string().url().default("https://api.z-api.io"),
  ZAPI_WEBHOOK_SECRET: z.string().default("")
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  SUPABASE_DATABASE_URL: process.env.SUPABASE_DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  DOMAIN_URL: process.env.DOMAIN_URL,
  ZAPI_INSTANCE_ID: process.env.ZAPI_INSTANCE_ID,
  ZAPI_INSTANCE_TOKEN: process.env.ZAPI_INSTANCE_TOKEN,
  ZAPI_CLIENT_TOKEN: process.env.ZAPI_CLIENT_TOKEN,
  ZAPI_BASE_URL: process.env.ZAPI_BASE_URL,
  ZAPI_WEBHOOK_SECRET: process.env.ZAPI_WEBHOOK_SECRET
});
