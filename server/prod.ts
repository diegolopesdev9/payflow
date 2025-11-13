// server/prod.ts - Servidor de produção com Hono
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import routes from "./routes";
import { readFileSync } from "fs";
import { join } from "path";

const PORT = Number(process.env.PORT) || 8080;

console.log('🚀 Iniciando PayFlow Production Server...');
console.log('📊 Porta:', PORT);

// Adicionar middleware para servir arquivos estáticos
routes.use('/*', serveStatic({
  root: './dist',
  rewriteRequestPath: (path) => path.replace(/^\//, '')
}));

// SPA fallback - serve index.html para todas as rotas não encontradas
routes.get('*', (c) => {
  const filePath = join(process.cwd(), 'dist', 'index.html');
  const html = readFileSync(filePath, 'utf-8');
  return c.html(html);
});

// Iniciar servidor
serve({
  fetch: routes.fetch,
  port: PORT,
  hostname: '0.0.0.0'
}, (info) => {
  console.log('✅ Production server running on port', info.port);
  console.log('📁 Serving static files from dist/');
  console.log('🔗 API available at /api');
  console.log('🔄 SPA fallback enabled for client-side routing');
});