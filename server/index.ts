import { serve } from "@hono/node-server";
import routes from "./routes";

const port = 3001;

serve({
  fetch: routes.fetch,
  port
}, () => {
  console.log(`Server is running on port ${port}`);
});