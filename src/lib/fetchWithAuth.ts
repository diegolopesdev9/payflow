
import { supabase } from "./supabase";

export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = new Headers(init.headers || {});
  const token = session?.access_token;
  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", headers.get("Content-Type") || "application/json");

  // 🔑 base URL configurável (dev/prod)
  const base = import.meta.env.VITE_API_URL || "";
  const url = typeof input === "string" ? base + input : input;

  const res = await fetch(input, { ...init, headers });
  if (res.status === 401) {
    await supabase.auth.signOut();
    if (location.pathname !== "/login") location.href = "/login";
  }
  return res;
}
