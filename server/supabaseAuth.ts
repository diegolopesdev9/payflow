import { createMiddleware } from "hono/factory";
import { createClient } from "@supabase/supabase-js";
import { Context } from "hono";

export const supabaseServer = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!, // anon é suficiente para validar tokens de usuário
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// Middleware que valida o token do Supabase e injeta user no contexto
export async function requireUser(c: Context, next: any) {
  console.log('\n🔐 requireUser - VERIFICANDO AUTH');

  const authHeader = c.req.header("Authorization");
  console.log('📋 authHeader:', authHeader ? `Bearer ${authHeader.substring(7, 20)}...` : 'AUSENTE');

  if (!authHeader) {
    console.log('❌ AUTH FALHOU: Header ausente');
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.replace("Bearer ", "");
  console.log('🎫 Token extraído, validando...');

  const { data: { user }, error } = await supabaseServer.auth.getUser(token);

  if (error || !user) {
    console.log('❌ AUTH FALHOU:', error?.message || 'User não encontrado');
    return c.json({ error: "Unauthorized" }, 401);
  }

  console.log('✅ AUTH OK - User:', user.id, user.email);

  c.set("user", user);
  c.set("userId", user.id);

  await next();
}