
import { Context, Next } from 'hono';
import { authenticateToken } from './auth';

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
export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  const auth = authenticateToken(authHeader);

  if (!auth) {
    return c.json({ error: 'Token de acesso inválido ou expirado' }, 401);
  }

  // Adicionar userId ao contexto para uso nas rotas
  c.set('userId', auth.userId);
  await next();
};

// Middleware de autenticação opcional (não bloqueia se não autenticado)
export const optionalAuthMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  const auth = authenticateToken(authHeader);

  if (auth) {
    c.set('userId', auth.userId);
  }

  await next();
};
