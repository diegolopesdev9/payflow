
import { supabase } from "./supabase";

// Helper que adiciona o Bearer token e resolve a base da API
async function fetchWithAuth(input: RequestInfo | URL, init: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();

  const headers = new Headers(init.headers || {});
  const token = session?.access_token;
  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", headers.get("Content-Type") || "application/json");

  // Resolve /api/... para a base correta (proxy do Vite ou VITE_API_URL em prod)
  const base = import.meta.env.VITE_API_URL || "";
  const url =
    typeof input === "string" || input instanceof URL
      ? (String(input).startsWith("/") ? (base + String(input)) : String(input))
      : (input as RequestInfo);

  const res = await fetch(url, { ...init, headers });

  // Se o token expirou, faz signOut e manda pro /login
  if (res.status === 401) {
    await supabase.auth.signOut();
    if (location.pathname !== "/login") location.href = "/login";
  }

  return res;
}

export { fetchWithAuth };
export default fetchWithAuth;
