
// src/lib/fetchWithAuth.ts
import { supabase } from './supabase'

type Input = RequestInfo | URL
type Init = RequestInit & { asJson?: boolean }

/**
 * fetchWithAuth
 * - Obtém o access_token do Supabase (sessão atual)
 * - Envia Authorization: Bearer <token> em TODAS as chamadas
 * - Define Content-Type: application/json quando body for objeto
 */
export async function fetchWithAuth(input: Input, init: Init = {}) {
  // Garante sempre a sessão mais recente (memória)
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  const headers = new Headers(init.headers || {})

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  // Se body for objeto e não vier um Content-Type explícito
  const hasBodyObject =
    init.body && typeof init.body === 'object' && !(init.body instanceof FormData)

  if (hasBodyObject && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  // Por padrão enviamos JSON quando passar objeto
  let body = init.body as BodyInit | undefined
  if (hasBodyObject) {
    body = JSON.stringify(init.body)
  }

  // Não precisamos de cookies 3rd-party no preview do Replit
  // o token via header resolve o cenário do iframe
  const finalInit: RequestInit = {
    ...init,
    headers,
    body,
    credentials: 'omit',
  }

  return fetch(input, finalInit)
}

export default fetchWithAuth
