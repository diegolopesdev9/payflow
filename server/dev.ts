import { serve } from "@hono/node-server";
import routes from "./routes";

const port = parseInt(process.env.API_PORT || '3001');

console.log("🚀 Starting API server...");

serve({
  fetch: routes.fetch,
  port,
  hostname: "0.0.0.0"
}, () => {
  console.log(`🔌 API server running on port ${port}`);
  console.log(`📡 API endpoints available at http://localhost:${port}/api`);
});