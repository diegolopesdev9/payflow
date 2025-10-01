
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente administrativo (service role) — usado no backend
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * getUser: valida o access token do usuário e retorna o objeto user
 * @param accessToken string - token "jwt" de sessão do supabase (do usuário logado)
 * @returns user | null
 */
export async function getUser(accessToken: string) {
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
    if (error) return null;
    return data.user ?? null;
  } catch {
    return null;
  }
}
