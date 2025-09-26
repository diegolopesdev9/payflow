
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import routes from "./routes";
import { serveStatic } from "hono/serve-static.module";

const app = new Hono();
app.route("/", routes); // API
app.get("/*", serveStatic({ root: "./dist" })); // frontend build

const port = Number(process.env.PORT) || 8080;
serve({ fetch: app.fetch, port }, () => {
  console.log(`[prod] Server listening on :${port}`);
});
