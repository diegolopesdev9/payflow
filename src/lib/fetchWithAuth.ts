
import { supabase } from "@/lib/supabase";

export async function fetchWithAuth(
  input: RequestInfo | URL,
  init: RequestInit = {}
) {
  const { data: { session } } = await supabase.auth.getSession();

  const headers = new Headers(init.headers || {});
  const token = session?.access_token;

  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const base = import.meta.env.VITE_API_URL || "";
  const url = typeof input === "string" ? base + input : input;

  return fetch(url, { ...init, headers });
}

// Também exportar como default, para compatibilidade:
export default fetchWithAuth;
