
import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer as createViteServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function start() {
  const app = express()

  // Middlewares comuns da sua API
  app.use(cors())
  app.use(express.json())

  // ==== SUAS ROTAS DE API EXISTENTES AQUI ====
  // Integração das rotas Hono existentes
  import { app as honoApp } from './routes.js';
  
  // Adaptador para usar rotas Hono no Express
  app.use('/api', async (req, res, next) => {
    try {
      // Cria um Request compatível com Hono
      const url = new URL(req.url, `http://${req.headers.host}`);
      const request = new Request(url, {
        method: req.method,
        headers: req.headers as Record<string, string>,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
      });

      // Executa a aplicação Hono
      const response = await honoApp.fetch(request);
      
      // Converte a resposta Hono para Express
      const body = await response.text();
      res.status(response.status);
      
      // Copia headers da resposta
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });
      
      res.send(body);
    } catch (error) {
      next(error);
    }
  });

  // ==== Vite como middleware (DEV) ====
  const vite = await createViteServer({
    root: path.resolve(__dirname, '..'),
    appType: 'custom',       // não manipular index.html sozinho
    server: { middlewareMode: true },
  })

  // Usa as rotas e middlewares do Vite (HMR, assets, etc.)
  app.use(vite.middlewares)

  const PORT = 5173
  app.listen(PORT, () => {
    console.log(`✅ App (SPA + API) rodando em http://localhost:${PORT}`)
  })
}

start().catch((e) => {
  console.error(e)
  process.exit(1)
})
