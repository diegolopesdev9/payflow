
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || (() => {
  console.warn('⚠️  JWT_SECRET não configurado! Use Replit Secrets para definir uma chave segura.');
  return 'development-only-key-not-for-production';
})();
const JWT_EXPIRES_IN = '7d';

// Schema de validação para senhas
export const passwordSchema = z.string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
    'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial');

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: passwordSchema
});

// Hash da senha
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Verificar senha
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// Gerar JWT token
export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verificar JWT token
export const verifyToken = (token: string): { userId: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch (error) {
    return null;
  }
};

// Cliente admin do Supabase (singleton para melhor performance)
let supabaseAdmin: ReturnType<typeof createClient> | null = null;

const getSupabaseAdmin = () => {
  if (supabaseAdmin) {
    return supabaseAdmin;
  }
  
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('Supabase admin credentials not configured');
    return null;
  }
  
  supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  return supabaseAdmin;
};

// Verificar JWT do Supabase usando admin client (método mais robusto)
export const verifySupabaseToken = async (token: string): Promise<{ userId: string } | null> => {
  try {
    const admin = getSupabaseAdmin();
    if (!admin) {
      return null;
    }

    // Verificar token usando o admin client
    const { data, error } = await admin.auth.getUser(token);
    
    if (error || !data.user) {
      console.log('Supabase token verification failed:', error?.message);
      return null;
    }
    
    return { userId: data.user.id };
  } catch (error) {
    console.log('Supabase token verification error:', error);
    return null;
  }
};

// Middleware para autenticação (legacy JWT ou Supabase)
export const authenticateToken = async (authHeader?: string): Promise<{ user: { id: string } } | null> => {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  // Tentar verificar como token do Supabase primeiro
  const supabaseAuth = await verifySupabaseToken(token);
  if (supabaseAuth) {
    return { user: { id: supabaseAuth.userId } };
  }
  
  // Fallback para JWT customizado (compatibilidade)
  const decoded = verifyToken(token);
  if (decoded) {
    return { user: { id: decoded.userId } };
  }

  return null;
};

// Extrair userId do token válido
export const extractUserId = async (authHeader?: string): Promise<string | null> => {
  const auth = await authenticateToken(authHeader);
  return auth?.user?.id || null;
};

// Rate limiting para tentativas de login
export class LoginAttempts {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private maxAttempts = 5;
  private lockoutTime = 15 * 60 * 1000; // 15 minutos

  isBlocked(email: string): boolean {
    const attempt = this.attempts.get(email);
    if (!attempt) return false;

    if (attempt.count >= this.maxAttempts) {
      const timeSinceLastAttempt = Date.now() - attempt.lastAttempt;
      if (timeSinceLastAttempt < this.lockoutTime) {
        return true;
      } else {
        // Reset após o tempo de bloqueio
        this.attempts.delete(email);
        return false;
      }
    }
    return false;
  }

  recordAttempt(email: string, success: boolean): void {
    if (success) {
      this.attempts.delete(email);
      return;
    }

    const current = this.attempts.get(email) || { count: 0, lastAttempt: 0 };
    this.attempts.set(email, {
      count: current.count + 1,
      lastAttempt: Date.now()
    });
  }

  getRemainingTime(email: string): number {
    const attempt = this.attempts.get(email);
    if (!attempt || attempt.count < this.maxAttempts) return 0;

    const timeSinceLastAttempt = Date.now() - attempt.lastAttempt;
    return Math.max(0, this.lockoutTime - timeSinceLastAttempt);
  }
}

export const loginAttempts = new LoginAttempts();
