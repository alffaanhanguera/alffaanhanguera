import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const runtimeDatabaseUrl =
  process.env.NODE_ENV === "development"
    ? process.env.DIRECT_URL || process.env.SUPABASE_DATABASE_URL
    : process.env.SUPABASE_DATABASE_URL;

export const prisma =
  global.prisma ??
  new PrismaClient({
    datasourceUrl: runtimeDatabaseUrl,
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
