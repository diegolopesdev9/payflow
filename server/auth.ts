import { createClient } from "@supabase/supabase-js";
import type { Context, Next } from "hono";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function requireUser(c: Context, next: Next) {
  const auth = c.req.header("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    return c.json({ error: "missing bearer token" }, 401);
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) {
    console.error("[requireUser] invalid token:", error?.message);
    return c.json({ error: "invalid token" }, 401);
  }

  // @ts-ignore -> Hono Context store
  c.set("user", data.user);
  await next();
}

export function getUser(c: Context) {
  // @ts-ignore
  return c.get("user");
}