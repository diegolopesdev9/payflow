
import { createMiddleware } from "hono/factory";
import { createClient } from "@supabase/supabase-js";

export const supabaseServer = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!, // anon é suficiente para validar tokens de usuário
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// Middleware que valida o token do Supabase e injeta user no contexto
export const requireUser = createMiddleware(async (c, next) => {
  const header = c.req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const token = header.slice(7);
  const { data, error } = await supabaseServer.auth.getUser(token);
  if (error || !data?.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  // injeta informações úteis no contexto
  c.set("userId", data.user.id);
  c.set("userEmail", data.user.email ?? null);
  c.set("user", data.user);
  await next();
});
