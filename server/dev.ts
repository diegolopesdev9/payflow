import { serve } from "@hono/node-server";
import { spawn } from "child_process";
import routes from "./routes";
import { gate } from "./middleware";

// Start the API server on port 3001 as expected by Vite proxy config
const API_PORT = Number(process.env.PORT) || 3001;

console.log('📦 Using configured storage (check startup logs above for storage type)');

// Aplicar gate middleware antes das rotas
routes.use("*", gate);

// Start API server
serve({
  fetch: routes.fetch,
  port: API_PORT,
  hostname: "0.0.0.0"
}, () => {
  console.log(`🚀 API server running on port ${API_PORT}`);
  console.log(`📡 API endpoints available at http://0.0.0.0:${API_PORT}/api`);
});

// Aguardar um pouco antes de iniciar o Vite para evitar conflitos
setTimeout(() => {
  console.log(`🔌 Starting Vite frontend server on port 5173...`);

  // Start Vite development server com configurações específicas para evitar o piscar
  const viteProcess = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5173'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: '5173',
      VITE_HMR_PORT: '5173' // Força o HMR a usar a mesma porta
    }
  });

  viteProcess.on('error', (error) => {
    console.error('Failed to start Vite:', error);
  });

  // Capturar sinais para fazer cleanup
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development servers...');
    viteProcess.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down development servers...');
    viteProcess.kill('SIGTERM');
    process.exit(0);
  });
}, 2000);