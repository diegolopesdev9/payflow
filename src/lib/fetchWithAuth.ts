
import { supabase } from "./supabase";

export async function fetchWithAuth(
  input: RequestInfo | URL,
  init: RequestInit = {}
) {
  // 1) Pega a sessão atual do Supabase
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  // 2) Monta headers e injeta o Authorization quando houver token
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  // 3) Respeita VITE_API_URL (opcional). Se não existir, usa a mesma origem (proxy do Vite)
  const base = import.meta.env.VITE_API_URL || "";
  const url = typeof input === "string" ? base + input : input;

  // 4) Faz o fetch. Mantemos credentials: 'include' para cookies (se algum dia usar)
  const res = await fetch(url, { ...init, headers, credentials: "include" });

  // 5) Se der 401, encerra a sessão local e manda para /login
  if (res.status === 401) {
    await supabase.auth.signOut();
    if (location.pathname !== "/login") location.href = "/login";
  }

  return res;
}
