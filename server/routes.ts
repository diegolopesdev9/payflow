import { Hono } from "hono";
import { requireUser, ok } from "./middleware";
import type { Context } from "hono";

export const app = new Hono();

// health
app.get("/api/healthz", (c) => ok(c));

// quem sou eu (exige login)
app.get("/api/whoami", requireUser, (c: Context) => {
  // @ts-ignore
  const user = c.get("user");
  return c.json({ user });
});

// exemplo de rota protegida: /api/users/me
app.get("/api/users/me", requireUser, (c: Context) => {
  // @ts-ignore
  const user = c.get("user");
  return c.json({ user });
});

// TODO: aqui entram suas rotas reais /api/bills, /api/categories etc,
// todas com requireUser para proteger.