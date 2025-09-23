
// Utilitários para gerenciar autenticação no frontend

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const getUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const logout = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  const user = getUser();
  return !!(token && user);
};

// Interceptor para adicionar token nas requisições
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Se receber 401, redirecionar para login
  if (response.status === 401) {
    logout();
    return response;
  }

  return response;
};

// Hook para verificar autenticação em componentes
export const useAuth = () => {
  const user = getUser();
  const token = getAuthToken();
  const authenticated = isAuthenticated();

  return {
    user,
    token,
    authenticated,
    logout,
  };
};
