
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL) throw new Error("SUPABASE_URL ausente");
if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY ausente");

// Cliente admin (server-side) para validar JWT de usuário
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Extrai bearer do header Authorization
export function getBearer(req: Request): string | null {
  const auth = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!auth) return null;
  const [, token] = auth.split(" ");
  return token || null;
}

// Valida token do usuário usando o service role (getUser)
export async function getUserFromRequest(req: Request) {
  const token = getBearer(req);
  if (!token) return { error: "missing bearer token" as const, user: null };
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return { error: "invalid token" as const, user: null };
  return { error: null, user: data.user };
}
