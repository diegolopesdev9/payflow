// server/dev.ts - Servidor Hono para desenvolvimento
import { serve } from "@hono/node-server";
import routes from "./routes";

const PORT = Number(process.env.PORT_API) || 8080;

// Verificar variáveis de ambiente essenciais
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  console.error('❌ ERRO: Variável SUPABASE_URL é obrigatória!');
  console.error('Configure-a no Replit Secrets (ícone de cadeado 🔒)');
  process.exit(1);
}

if (!SUPABASE_KEY) {
  console.error('❌ ERRO: Configure SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_ANON_KEY!');
  console.error('Configure no Replit Secrets (ícone de cadeado 🔒)');
  process.exit(1);
}

console.log('\n🚀 Iniciando PayFlow API (Hono)...');
console.log('📊 Ambiente:', process.env.NODE_ENV || 'development');
console.log('🔗 Supabase URL:', SUPABASE_URL);
console.log('🔑 Supabase Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE_KEY ✅' : 'ANON_KEY ✅');
console.log('⚙️  Porta configurada:', PORT);

// Iniciar servidor Hono
serve({
  fetch: routes.fetch,
  port: PORT,
  hostname: '0.0.0.0'
}, (info) => {
  console.log('\n✅ ========================================');
  console.log('✅  PayFlow API rodando com SUCESSO!');
  console.log('✅ ========================================');
  console.log(`✅  URL: http://0.0.0.0:${info.port}`);
  console.log(`✅  Framework: Hono`);
  console.log(`✅  Rotas: server/routes.ts`);
  console.log(`✅  Auth: server/supabaseAuth.ts`);
  console.log(`✅  Storage: server/supabase.ts`);
  console.log('✅ ========================================\n');
});