import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import routes from "./routes";

async function startDevServer() {
  // Create Vite dev server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });

  // Create Node.js HTTP server
  const server = createServer(async (req, res) => {
    const url = req.url || '/';
    
    try {
      // Handle API routes with Hono
      if (url.startsWith('/api')) {
        // Convert Node.js request to Fetch Request
        const body = req.method !== 'GET' && req.method !== 'HEAD' 
          ? await new Promise<Buffer>((resolve) => {
              const chunks: Buffer[] = [];
              req.on('data', chunk => chunks.push(chunk));
              req.on('end', () => resolve(Buffer.concat(chunks)));
            })
          : undefined;

        const fetchRequest = new Request(`http://localhost:5000${url}`, {
          method: req.method,
          headers: req.headers as HeadersInit,
          body: body?.length ? body.toString() : undefined,
        });

        // Get response from Hono app
        const honoResponse = await routes.fetch(fetchRequest);
        
        // Copy response back to Node.js response
        res.statusCode = honoResponse.status;
        honoResponse.headers.forEach((value, key) => {
          res.setHeader(key, value);
        });
        
        if (honoResponse.body) {
          const reader = honoResponse.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
          }
        }
        res.end();
        return;
      }

      // For non-API routes, use Vite middleware for frontend assets and HMR
      vite.middlewares(req, res, () => {
        // If Vite doesn't handle it, serve the React app
        res.setHeader('Content-Type', 'text/html');
        res.end(`
          <!doctype html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Bill Manager</title>
            </head>
            <body>
              <div id="root"></div>
              <script type="module" src="/src/main.tsx"></script>
            </body>
          </html>
        `);
      });
    } catch (error) {
      console.error('Server error:', error);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import routes from "./routes";

const port = 5000;
  
  const app = routes;
  
  // Serve static files
  app.use("/*", serveStatic({ root: "./dist" }));
  
  serve({
    fetch: app.fetch,
    port: port,
    hostname: "0.0.0.0"
  }, () => {
    console.log(`🚀 Full-stack server running on port ${port}`);
    console.log(`📱 Frontend: http://localhost:${port}`);
    console.log(`🔌 API: http://localhost:${port}/api`);
    console.log(`🔥 HMR and dev tools available`);
  });
}

startDevServer().catch((error) => {
  console.error('Failed to start dev server:', error);
  process.exit(1);
});exit(1);
});