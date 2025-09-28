
import { supabase } from "./supabase";

async function getTokenWithRetry(maxWaitMs = 1200): Promise<string | null> {
  // tenta obter a sessão imediatamente; se não houver, espera pequenos intervalos
  const started = Date.now();
  while (Date.now() - started < maxWaitMs) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? null;
    if (token) return token;
    await new Promise(r => setTimeout(r, 150));
  }
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  const token = await getTokenWithRetry();

  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", headers.get("Content-Type") || "application/json");

  const baseEnv = (import.meta.env.VITE_API_URL ?? "").trim();
  const base = baseEnv ? baseEnv : "";
  const url = typeof input === "string" ? base + input : input;

  let res: Response;
  try {
    res = await fetch(url, { ...init, headers });
  } catch (e) {
    console.error("[fetchWithAuth] network fail:", { url, message: (e as Error).message });
    throw e;
  }

  if (res.status === 401) {
    const hadToken = !!token;
    console.warn("[fetchWithAuth] 401 from API:", { url, hadToken });
    // Em vez de deslogar de cara, só marcamos e deixamos a tela lidar.
    // Isso evita loop de logout quando a API está mal configurada.
    return res;
  }

  return res;
}
