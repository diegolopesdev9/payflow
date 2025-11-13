import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth, useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User as UserIcon, Mail, Calendar, Edit, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BottomNavigation } from "@/components/BottomNavigation";

type UserProfile = {
  id: string;
  email: string;
  name?: string | null;
  created_at?: string;
  createdAt?: string;
};

export default function Profile() {
  const [location, setLocation] = useLocation();
  const { user: authUser, authenticated, logout } = useAuth();
  const { toast } = useToast();

  // ✅ useQuery SEM refetch automático
  const { data: userData, isLoading: loading, isError: error } = useQuery({
    queryKey: ['/api/users/me'],
    queryFn: async () => {
      console.log('🔄 [Profile] Buscando dados do usuário...');
      const res = await fetchWithAuth("/api/users/me");
      if (!res.ok) {
        throw new Error(`Erro ao carregar perfil (${res.status})`);
      }
      const data = await res.json();
      const userData = data?.user ?? data ?? null;
      console.log('✅ [Profile] Dados recebidos:', userData);
      return userData;
    },
    enabled: !!authUser?.id,
    staleTime: 0, // ✅ Sempre considera dados "velhos", força refetch
    refetchOnMount: true, // ✅ Busca dados ao entrar na página
    refetchOnWindowFocus: true, // ✅ Busca dados ao focar na aba
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (authenticated === false) {
      setLocation("/login");
    }
  }, [authenticated, setLocation]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
      setLocation("/login");
    } catch (error) {
      toast({
        title: "Erro ao fazer logout",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (authenticated === false) {
    return null;
  }

  if (loading || authenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary">
        <div className="bg-primary/80 backdrop-blur-sm border-b border-primary-foreground/10">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-8 w-24 bg-primary-foreground/20 rounded animate-pulse" />
                <div className="h-4 w-48 bg-primary-foreground/20 rounded animate-pulse" />
              </div>
              <div className="h-10 w-20 bg-primary-foreground/20 rounded animate-pulse" />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 space-y-6 pb-24">
          <Card className="stat-card">
            <CardHeader>
              <div className="h-6 w-48 bg-muted/50 rounded animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-5 h-5 bg-muted rounded animate-pulse mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                      <div className="h-5 w-48 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-10 w-full bg-muted/50 rounded animate-pulse mt-4" />
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader>
              <div className="h-6 w-40 bg-muted/50 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted/50 rounded animate-pulse" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary flex items-center justify-center">
        <Card className="stat-card max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-lg mb-4">Erro ao carregar perfil</p>
            <Button onClick={() => setLocation("/dashboard")} className="btn-financial">
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const user: UserProfile = userData;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary">
      <div className="bg-primary/80 backdrop-blur-sm border-b border-primary-foreground/10 relative z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">Perfil</h1>
              <p className="text-primary-foreground/80">Gerencie suas informações</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10 relative z-10 bg-primary/50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6 pb-24">
        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <UserIcon className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Nome</div>
                  <div className="font-medium">{user.name || "Não informado"}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">E-mail</div>
                  <div className="font-medium">{user.email}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Membro desde</div>
                  <div className="font-medium">{formatDate(user.created_at || user.createdAt)}</div>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setLocation("/profile/edit")}
              className="w-full btn-financial mt-4"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar Perfil
            </Button>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ID da Conta:</span>
                <span className="font-mono text-xs">{user.id.substring(0, 8)}...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}