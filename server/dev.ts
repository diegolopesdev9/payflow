
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
  // Exemplo: app.use('/api', require('./router').default)
  // ou importe e use o que você já tem hoje:
  // import { router } from './router'
  // app.use('/api', router)

  // Se você tem middlewares de autenticação, mantenha-os antes das rotas:
  // import { requireUser } from './middleware'
  // app.use('/api/secure', requireUser, secureRouter)

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
