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
  console.log('\n🔐 requireUser middleware - INÍCIO');

  const authHeader = c.req.header("Authorization");
  console.log('📋 Authorization header:', authHeader ? `Bearer ${authHeader.substring(7, 20)}...` : 'AUSENTE');

  if (!authHeader?.startsWith("Bearer ")) {
    console.log('❌ Token ausente ou formato inválido');
    return c.json({ error: "Token de acesso inválido ou expirado" }, 401);
  }

  const token = authHeader.replace("Bearer ", "");
  console.log('🔑 Token extraído (primeiros 20 chars):', token.substring(0, 20) + '...');

  console.log('📞 Chamando supabaseServer.auth.getUser...');
  const { data: { user }, error } = await supabaseServer.auth.getUser(token);

  if (error) {
    console.log('❌ Erro ao validar token:', JSON.stringify(error, null, 2));
    return c.json({ error: "Token de acesso inválido ou expirado" }, 401);
  }

  if (!user) {
    console.log('❌ Token válido mas user não encontrado');
    return c.json({ error: "Token de acesso inválido ou expirado" }, 401);
  }

  console.log('✅ User autenticado:', user.id, user.email);
  c.set("user", user);
  c.set("userId", user.id);

  console.log('➡️ Passando para próximo middleware/handler');
  await next();
}