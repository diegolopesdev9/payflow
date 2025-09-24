import { serve } from "@hono/node-server";
import routes from "./routes";

const port = Number(process.env.PORT) || 8080;

serve({
  fetch: routes.fetch,
  port
}, () => {
  console.log(`Server is running on port ${port}`);
});