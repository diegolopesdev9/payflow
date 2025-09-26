
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

// Interceptor para adicionar token nas requisições
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.warn('Session error in fetchWithAuth:', error.message);
    }
    
    const token = session?.access_token;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    // Sempre adicionar Authorization header se tivermos token
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Interceptar 401 com cuidado - só redirecionar se não estivermos em fluxo de boot/refresh
    if (response.status === 401) {
      // Verificar se estamos em páginas que não requerem auth
      const currentPath = window.location.pathname;
      const publicPaths = ['/', '/login', '/register', '/forgot-password'];
      
      if (!publicPaths.includes(currentPath)) {
        console.log('401 received, signing out and redirecting to login');
        await supabase.auth.signOut();
        // Usar setTimeout para evitar problemas de race condition
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }

    return response;
  } catch (error) {
    console.error('fetchWithAuth error:', error);
    throw error;
  }
};

// Hook para verificar autenticação em componentes (compatível com código existente)
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Get initial session with proper error handling
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.warn('Auth session error:', error.message);
          setUser(null);
          setAuthenticated(false);
        } else if (session?.user) {
          setUser(convertSupabaseUser(session.user));
          setAuthenticated(true);
        } else {
          setUser(null);
          setAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setUser(null);
          setAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('Auth state change:', event);
      
      if (session?.user) {
        setUser(convertSupabaseUser(session.user));
        setAuthenticated(true);
      } else {
        setUser(null);
        setAuthenticated(false);
      }
      
      if (!isInitialized) {
        setLoading(false);
        setIsInitialized(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isInitialized]);

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
  };
};
