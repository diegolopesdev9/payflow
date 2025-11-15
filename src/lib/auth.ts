import { useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from './supabase';

// Legacy interface for backward compatibility
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

// Convert Supabase user to legacy User format for compatibility
const convertSupabaseUser = (supabaseUser: SupabaseUser): User => {
  return {
    id: supabaseUser.id,
    name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Usuário',
    email: supabaseUser.email || '',
    createdAt: supabaseUser.created_at,
    updatedAt: supabaseUser.updated_at,
  };
};

// Lista de emails admin
const ADMIN_EMAILS = ['diegolopes.dev9@gmail.com'];

// Verificar se usuário é admin
export const isAdmin = (user: User | null): boolean => {
  if (!user || !user.email) return false;
  return ADMIN_EMAILS.includes(user.email);
};

// Função auxiliar: obtém token do Supabase
async function getTokenWithRetry(): Promise<string | null> {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('[getTokenWithRetry] Erro ao obter sessão:', error);
    return null;
  }
  
  const token = session?.access_token ?? null;
  console.log('[getTokenWithRetry] Token obtido:', token ? '✅ SIM' : '❌ NÃO');
  
  return token;
}

// Interceptor melhorado para adicionar token nas requisições
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = await getTokenWithRetry();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const baseEnv = (import.meta.env.VITE_API_URL ?? "").trim();
  const base = baseEnv ? baseEnv : "";
  const fullUrl = base + url;

  let response: Response;
  try {
    response = await fetch(fullUrl, {
      ...options,
      headers,
    });
  } catch (e) {
    console.error("[fetchWithAuth] network fail:", { url: fullUrl, message: (e as Error).message });
    throw e;
  }

  if (response.status === 401) {
    const hadToken = !!token;
    console.warn("[fetchWithAuth] 401 unauthorized:", fullUrl, { hadToken });
    if (hadToken) {
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
    return response;
  }

  return response;
};

// Hook para verificar autenticação em componentes (compatível com código existente)
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(convertSupabaseUser(session.user));
        setAuthenticated(true);
      } else {
        setUser(null);
        setAuthenticated(false);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(convertSupabaseUser(session.user));
        setAuthenticated(true);
      } else {
        setUser(null);
        setAuthenticated(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAuthenticated(false);
    window.location.href = '/login';
  };

  return {
    user,
    authenticated,
    loading,
    logout,
    isAdmin: isAdmin(user),
  };
};