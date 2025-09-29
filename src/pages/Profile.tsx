import { useEffect, useState } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";

type Me = {
  id: string;
  email: string;
  name?: string | null;
  avatar_url?: string | null;
  metadata?: Record<string, any>;
};

export default function Profile() {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetchWithAuth("/api/users/me");
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`Falha ao carregar perfil (${res.status}): ${txt}`);
        }
        const data = await res.json();
        const u: Me = data?.user ?? data ?? null;
        if (alive) setUser(u);
      } catch (e: any) {
        if (alive) setErr(e?.message || "Erro ao carregar perfil");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) return <div className="p-6">Carregando perfil…</div>;
  if (err) {
    return (
      <div className="p-6 text-center">
        <p className="mb-4">Erro ao carregar perfil</p>
        <a href="/dashboard" className="underline">Voltar ao Dashboard</a>
        <pre className="mt-4 text-xs opacity-60">{err}</pre>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="mb-4">Perfil não encontrado</p>
        <a href="/dashboard" className="underline">Voltar ao Dashboard</a>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Seu perfil</h1>
      <div className="space-y-1">
        <div><b>ID:</b> {user.id}</div>
        <div><b>Email:</b> {user.email}</div>
        {user.name ? <div><b>Nome:</b> {user.name}</div> : null}
      </div>
    </div>
  );
}