
import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

const PORT = Number(process.env.PORT) || 8080
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ ERRO: Variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias!')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

const authenticateUser = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' })
  }
  const token = authHeader.substring(7)
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido ou expirado' })
    }
    req.user = user
    next()
  } catch (error) {
    console.error('Erro na autenticação:', error)
    return res.status(500).json({ error: 'Erro ao validar token' })
  }
}

app.get('/api/healthz', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString(), service: 'PayFlow API', version: '1.0.0' })
})

app.get('/api/whoami', authenticateUser, (req: any, res) => {
  res.json({ user: { id: req.user.id, email: req.user.email, created_at: req.user.created_at } })
})

app.get('/api/users/me', authenticateUser, (req: any, res) => {
  res.json({ user: { id: req.user.id, email: req.user.email, name: req.user.user_metadata?.name || req.user.email?.split('@')[0] || 'Usuário', created_at: req.user.created_at } })
})

app.get('/api/bills', authenticateUser, async (req: any, res) => {
  try {
    const { data, error } = await supabase.from('bills').select('*').eq('user_id', req.user.id).order('due_date', { ascending: false })
    if (error) throw error
    res.json(data)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/bills/upcoming', authenticateUser, async (req: any, res) => {
  try {
    const today = new Date().toISOString()
    const { data, error } = await supabase.from('bills').select('*').eq('user_id', req.user.id).eq('is_paid', false).gte('due_date', today).order('due_date', { ascending: true }).limit(10)
    if (error) throw error
    res.json(data)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/bills/:id', authenticateUser, async (req: any, res) => {
  try {
    const { data, error } = await supabase.from('bills').select('*').eq('id', req.params.id).eq('user_id', req.user.id).single()
    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Conta não encontrada' })
    res.json(data)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/bills', authenticateUser, async (req: any, res) => {
  try {
    const billData = { ...req.body, user_id: req.user.id }
    const { data, error } = await supabase.from('bills').insert([billData]).select().single()
    if (error) throw error
    res.status(201).json(data)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

app.put('/api/bills/:id', authenticateUser, async (req: any, res) => {
  try {
    const { data, error } = await supabase.from('bills').update(req.body).eq('id', req.params.id).eq('user_id', req.user.id).select().single()
    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Conta não encontrada' })
    res.json(data)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/bills/:id', authenticateUser, async (req: any, res) => {
  try {
    const { error } = await supabase.from('bills').delete().eq('id', req.params.id).eq('user_id', req.user.id)
    if (error) throw error
    res.status(204).send()
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/categories', authenticateUser, async (req: any, res) => {
  try {
    const { data, error } = await supabase.from('categories').select('*').eq('user_id', req.user.id)
    if (error) throw error
    res.json(data)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/reports/summary', authenticateUser, async (req: any, res) => {
  try {
    res.json({ message: 'Relatórios em desenvolvimento' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.use(express.static(path.join(__dirname, '../dist')))

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Production server running on port ${PORT}`)
  console.log(`📦 Serving static files from dist/`)
  console.log(`🔌 API available at /api`)
})
