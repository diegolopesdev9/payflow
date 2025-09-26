
import { createMiddleware } from "hono/factory";
import { supabaseServer } from "./supabase";

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
  c.set("userId", data.user.id);
  c.set("userEmail", data.user.email || null);
  c.set("user", data.user);
  await next();
});
