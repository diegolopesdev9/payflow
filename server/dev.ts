import { serve } from "@hono/node-server";
import { spawn } from "child_process";
import routes from "./routes";
import { gate } from "./middleware";

// Start the API server on port 8080
const API_PORT = 8080;

console.log('📦 Using configured storage (check startup logs above for storage type)');

// Aplicar gate middleware antes das rotas
routes.use("*", gate);

// Start API server
serve({
  fetch: routes.fetch,
  port: API_PORT,
  hostname: "0.0.0.0"
}, () => {
  console.log(`API server running on port 8080`);
});

// Start Vite development server
console.log(`Starting Vite frontend server on port 5173`);

const viteProcess = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5173'], {
  stdio: 'inherit'
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