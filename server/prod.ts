// server/prod.ts - Servidor de produção com Hono
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import routes from "./routes";

const PORT = Number(process.env.PORT) || 8080;

console.log('🚀 Iniciando PayFlow Production Server...');
console.log('📊 Porta:', PORT);

// Adicionar middleware para servir arquivos estáticos
routes.use('/*', serveStatic({
  root: './dist',
  rewriteRequestPath: (path) => path.replace(/^\//, '')
}));

// Iniciar servidor
serve({
  fetch: routes.fetch,
  port: PORT,
  hostname: '0.0.0.0'
}, (info) => {
  console.log('✅ Production server running on port', info.port);
  console.log('📁 Serving static files from dist/');
  console.log('🔗 API available at /api');
});