
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import routes from "./routes";
import { readFileSync } from "fs";
import { join } from "path";

// Cria o app de produção
const app = routes;

// Serve arquivos estáticos do dist para todas as rotas não-API
app.use("*", async (c, next) => {
  // Se a rota começa com /api, deixa as rotas da API tratarem
  if (c.req.path.startsWith('/api')) {
    return next();
  }
  
  // Para outras rotas, tenta servir arquivos estáticos
  const staticHandler = serveStatic({
    root: "./dist",
    index: "index.html"
  });
  
  const response = await staticHandler(c, next);
  
  // Se o arquivo não foi encontrado, serve o index.html para SPA routing
  if (response.status === 404) {
    try {
      const indexPath = join(process.cwd(), "dist", "index.html");
      const indexHtml = readFileSync(indexPath, "utf-8");
      return c.html(indexHtml);
    } catch (error) {
      console.error("Error serving index.html:", error);
      return c.text("Application not found. Please build the project first.", 404);
    }
  }
  
  return response;
});

const PORT = Number(process.env.PORT) || 3001;

console.log("🚀 Starting production server...");
console.log(`📦 Serving static files from ./dist`);
console.log(`🔌 API available at /api`);

serve({
  fetch: app.fetch,
  port: PORT,
  hostname: "0.0.0.0"
}, () => {
  console.log(`✅ Production server running on port ${PORT}`);
  console.log(`🌐 App: http://0.0.0.0:${PORT}`);
  console.log(`🔌 API: http://0.0.0.0:${PORT}/api`);
});
