import { serve } from "@hono/node-server";
import { spawn } from "child_process";
import routes from "./routes";

// Start the API server on port 3001 as expected by Vite proxy config
const API_PORT = 3001;

console.log('⚠️  PostgreSQL not available, using memory storage');

// Start API server
serve({
  fetch: routes.fetch,
  port: API_PORT,
  hostname: "0.0.0.0"
}, () => {
  console.log(`🚀 API server running on port ${API_PORT}`);
  console.log(`📡 API endpoints available at http://0.0.0.0:${API_PORT}/api`);

  // Start Vite development server
  const viteProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: '5000' }
  });

  viteProcess.on('error', (error) => {
    console.error('Failed to start Vite:', error);
  });

  console.log(`🔌 Starting Vite frontend server on port 5000...`);
});