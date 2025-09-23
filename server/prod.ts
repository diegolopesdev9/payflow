
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import routes from "./routes";
import { readFileSync } from "fs";
import { join } from "path";

// Cria o app de produção
const app = routes;

// Serve arquivos estáticos do dist
app.use("/*", serveStatic({
  root: "./dist",
  index: "index.html"
}));

// Fallback para SPA - serve index.html para rotas não encontradas
app.get("*", async (c) => {
  try {
    const indexPath = join(process.cwd(), "dist", "index.html");
    const indexHtml = readFileSync(indexPath, "utf-8");
    return c.html(indexHtml);
  } catch (error) {
    console.error("Error serving index.html:", error);
    return c.text("Application not found. Please build the project first.", 404);
  }
});

const port = parseInt(process.env.PORT || "5000");

console.log("🚀 Starting production server...");
console.log(`📦 Serving static files from ./dist`);
console.log(`🔌 API available at /api`);

serve({
  fetch: app.fetch,
  port,
  hostname: "0.0.0.0"
}, () => {
  console.log(`✅ Production server running on port ${port}`);
  console.log(`🌐 App: http://localhost:${port}`);
  console.log(`🔌 API: http://localhost:${port}/api`);
});
