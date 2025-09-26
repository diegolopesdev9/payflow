import { Hono } from "hono";
import { serve } from "@hono/node-server";
import routes from "./routes";
import { serveStatic } from "hono/serve-static.module";

const app = new Hono();

// monta todas as rotas da API (ex.: /api/*) já definidas em routes
app.route("/", routes);

// serve os arquivos estáticos do build Vite
app.get("/*", serveStatic({ root: "./dist" }));

const port = Number(process.env.PORT) || 8080;
serve({ fetch: app.fetch, port }, () => {
  console.log(`[prod] Server listening on :${port}`);
});