import type { Context } from "hono";
import { getUser } from "./auth";
import { ContextVariables } from './types';
import type { Context as HonoContext, Next as HonoNext } from "hono";

// Middleware que exige usuário autenticado
export async function requireUser(c: Context, next: () => Promise<void>) {
  // 1) Tenta Authorization: Bearer <token>
  const authHeader = c.req.header("Authorization");
  let accessToken: string | undefined;

  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    accessToken = authHeader.slice(7).trim();
  }

  // 2) Fallback: cookie 'sb-access-token'
  if (!accessToken) {
    const cookieHeader = c.req.header("cookie") || "";
    const m = /(?:^|;\s*)sb-access-token=([^;]+)/i.exec(cookieHeader);
    if (m) {
      try {
        accessToken = decodeURIComponent(m[1]);
      } catch {
        accessToken = m[1];
      }
    }
  }

  if (!accessToken) {
    return c.json({ error: "missing bearer token" }, 401);
  }

  const user = await getUser(accessToken);
  if (!user) {
    return c.json({ error: "invalid token" }, 401);
  }

  // anexa o user na Context (se você já usa outra chave, mantenha)
  // @ts-ignore
  c.set("user", user);
  await next();
}

export function ok(c: Context) {
  return c.json({ ok: true, time: new Date().toISOString() });
}

// Rotas que devem passar SEM exigir Bearer ou API Key:
const PUBLIC_PATHS = ["/api/healthz", "/api/whoami", "/api/users/me"];

export async function gate(c: HonoContext, next: HonoNext) {
  const url = new URL(c.req.url);
  const path = url.pathname;

  // Público: healthz, whoami, users/me
  if (PUBLIC_PATHS.some((p) => path.startsWith(p))) {
    return next();
  }

  // Se vier Bearer token, deixa passar (rotas protegidas via requireUser lidarão depois)
  const auth = c.req.header("authorization") || "";
  if (auth.startsWith("Bearer ")) {
    return next();
  }

  // (Opcional) Chave interna para jobs/scripts
  const apiKey = c.req.header("x-api-key");
  if (apiKey && apiKey === process.env.INTERNAL_API_KEY) {
    return next();
  }

  // Caso contrário, bloqueia
  return c.json({ error: "Acesso negado" }, 403);
}

// Rate limiting por IP
class RateLimit {
  private requests: Map<string, { count: number; windowStart: number }> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) { // 100 reqs/15min
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isBlocked(ip: string): boolean {
    const now = Date.now();
    const record = this.requests.get(ip);

    if (!record) {
      this.requests.set(ip, { count: 1, windowStart: now });
      return false;
    }

    // Reset window se passou do tempo
    if (now - record.windowStart > this.windowMs) {
      this.requests.set(ip, { count: 1, windowStart: now });
      return false;
    }

    // Incrementar contador
    record.count++;

    // Verificar se excedeu o limite
    return record.count > this.maxRequests;
  }

  getRemainingTime(ip: string): number {
    const record = this.requests.get(ip);
    if (!record) return 0;

    const elapsed = Date.now() - record.windowStart;
    return Math.max(0, this.windowMs - elapsed);
  }
}

// Instâncias de rate limiting
export const apiRateLimit = new RateLimit(100, 15 * 60 * 1000); // 100 reqs/15min para API geral
export const authRateLimit = new RateLimit(10, 15 * 60 * 1000);  // 10 reqs/15min para auth

// Middleware de rate limiting
export const rateLimitMiddleware = (rateLimit: RateLimit) => {
  return async (c: Context, next: Next) => {
    const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
              || c.req.header('x-real-ip')
              || c.env?.remoteAddr
              || 'unknown';

    if (rateLimit.isBlocked(ip)) {
      const remainingTime = Math.ceil(rateLimit.getRemainingTime(ip) / 1000 / 60);
      return c.json({
        error: 'Muitas requisições. Tente novamente em alguns minutos.',
        retryAfter: remainingTime
      }, 429);
    }

    await next();
  };
};

// Middleware de autenticação
export const authMiddleware = async (c: Context<{ Variables: ContextVariables }>, next: Next) => {
  const authHeader = c.req.header('Authorization');
  const auth = await authenticateToken(authHeader); // Assuming authenticateToken is imported from './auth'

  if (!auth) {
    return c.json({ error: 'Token de acesso inválido ou expirado' }, 401);
  }

  // Adicionar userId ao contexto para uso nas rotas
  c.set('userId', auth.user.id);
  await next();
};

// Middleware de autenticação opcional (não bloqueia se não autenticado)
export const optionalAuthMiddleware = async (c: Context<{ Variables: ContextVariables }>, next: Next) => {
  const authHeader = c.req.header('Authorization');
  const auth = await authenticateToken(authHeader); // Assuming authenticateToken is imported from './auth'

  if (auth) {
    c.set('userId', auth.user.id);
  }

  await next();
};