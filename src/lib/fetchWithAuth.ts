
import { supabase } from "./supabase";

export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = new Headers(init.headers || {});
  const token = session?.access_token;
  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", headers.get("Content-Type") || "application/json");

  const baseEnv = (import.meta.env.VITE_API_URL ?? "").trim();
  const base = baseEnv ? baseEnv : ""; // em dev, string vazia para usar o proxy do Vite

  const url = typeof input === "string" ? base + input : input;

  let res: Response;
  try {
    res = await fetch(url, { ...init, headers });
  } catch (e) {
    console.error("[fetchWithAuth] network fail:", { url, message: (e as Error).message });
    throw e;
  }

  if (res.status === 401) {
    console.warn("[fetchWithAuth] 401 unauthorized:", url);
    await supabase.auth.signOut();
    if (location.pathname !== "/login") location.href = "/login";
  }
  return res;
}
