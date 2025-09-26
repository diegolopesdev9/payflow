
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    // 1º check: sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setAuthenticated(!!session);
      setLoading(false);
    });

    // 2º: escuta mudanças de auth (login/refresh/logout)
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!mounted) return;
      setAuthenticated(!!session);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div className="p-6 text-sm opacity-70">Carregando…</div>;
  if (!authenticated) return <Navigate to="/login" replace />;
  return children;
}
