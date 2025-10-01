import { serve } from "@hono/node-server";
import { app } from "./routes";

const PORT = Number(process.env.PORT || 8080);
console.log("📦 Using configured storage");
console.log(`🚀 API server running on port ${PORT}`);

serve({ fetch: app.fetch, port: PORT });