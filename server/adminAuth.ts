
import { Context } from "hono";

// Lista de emails com acesso admin
const ADMIN_EMAILS = [
  'diegolopes.dev9@gmail.com'
];

// Middleware para verificar se usuário é admin
export const requireAdmin = async (c: Context, next: () => Promise<void>) => {
  try {
    // Pegar token do header Authorization
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Token não fornecido' }, 401);
    }

    const token = authHeader.substring(7);

    // Verificar token com Supabase
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    const { data: { user }, error } = await supabaseClient.auth.getUser(token);

    if (error || !user) {
      console.log('❌ [requireAdmin] Token inválido');
      return c.json({ error: 'Não autorizado' }, 401);
    }

    // Verificar se email está na lista de admins
    if (!ADMIN_EMAILS.includes(user.email || '')) {
      console.log('❌ [requireAdmin] Usuário não é admin:', user.email);
      return c.json({ error: 'Acesso negado - apenas administradores' }, 403);
    }

    console.log('✅ [requireAdmin] Admin autenticado:', user.email);

    // Passar userId para próximas funções
    c.set('userId', user.id);
    c.set('user', user);
    c.set('isAdmin', true);

    await next();
  } catch (error: any) {
    console.error('❌ [requireAdmin] Erro:', error);
    return c.json({ error: 'Erro na autenticação' }, 500);
  }
};
