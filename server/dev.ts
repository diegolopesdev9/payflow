
// server/dev.ts
import express from 'express'
import cors from 'cors'

const app = express()

// CORS (ajuste origins se precisar)
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

// --- Rotas de saúde e whoami (exemplo) ---
app.get('/api/healthz', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() })
})

// Se você já tem middleware de auth real, injete aqui.
// Deixei uma versão "no-op" para não travar o fluxo.
app.get('/api/whoami', (req, res) => {
  // se tiver Authorization e token válido, devolva o user; aqui vamos só simular:
  const auth = req.headers.authorization || ''
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing bearer token' })
  }
  // TODO: validar o JWT do Supabase aqui, se quiser
  return res.json({ user: { id: 'demo', email: 'demo@local' } })
})

const PORT = Number(process.env.PORT_API) || 8080
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API server running on port ${PORT}`)
})
