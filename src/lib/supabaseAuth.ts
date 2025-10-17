// This file has been removed - all auth functionality is now centralized in src/lib/auth.ts and src/lib/supabase.ts
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  console.log('\n🌐 fetchWithAuth - INÍCIO');
  console.log('📍 URL:', url);
  console.log('📋 Method:', options.method || 'GET');

  const { data: { session } } = await supabase.auth.getSession();
  console.log('🔐 Session existe?', !!session);
  console.log('🔑 Token existe?', !!session?.access_token);

  if (!session?.access_token) {
    console.error('❌ [fetchWithAuth] no session/token');
    throw new Error('No authentication token');
  }

  console.log('🔑 Token (primeiros 20 chars):', session.access_token.substring(0, 20) + '...');
  console.log('📦 Body:', options.body);

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  console.log('📡 Response status:', response.status);

  if (response.status === 401) {
    console.log('❌ [fetchWithAuth] 401 unauthorized:', url, { hadToken: !!session?.access_token });
    await supabase.auth.signOut();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  console.log('✅ fetchWithAuth - sucesso');
  return response;
}