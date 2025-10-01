
import { supabase } from "./supabase";

export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}) {
  // usaremos o proxy do Vite: /api -> 127.0.0.1:8080
  const base = "";
  const url = typeof input === "string" ? base + input : input;

  const { data: { session } } = await supabase.auth.getSession();
  const headers = new Headers(init.headers || {});
  const token = session?.access_token || null;
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const res = await fetch(url, { ...init, headers });

  if (res.status === 401 || res.status === 403) {
    await supabase.auth.signOut();
    if (location.pathname !== "/login") location.href = "/login";
  }
  return res;
}
export default fetchWithAuth;
