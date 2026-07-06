export function isDatabaseConfigured() {
  return Boolean(process.env.SUPABASE_DATABASE_URL && process.env.DIRECT_URL);
}
