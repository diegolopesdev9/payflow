import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Settings,
  Shield,
  Bell,
  Smartphone,
  Tag,
  HelpCircle,
  LogOut,
  ChevronRight,
  Home,
  CreditCard,
  TrendingUp,
  Edit
} from "lucide-react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";


const Profile = () => {
  const [location, setLocation] = useLocation();
  const { user: authUser, authenticated, logout } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (authenticated === false) {
      setLocation("/login");
    }
  }, [authenticated, setLocation]);

  // Fetch user details using React Query
  const { data: user, isLoading, isError } = useQuery<User>({
    queryKey: [`/api/users/${authUser?.id}`],
    enabled: !!authUser?.id,
  });

  if (authenticated === false) {
    return null;
  }

  // Show loading while auth is resolving or user data is loading
  if (authenticated === null || (authenticated && !authUser) || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary flex items-center justify-center">
        <div className="text-primary-foreground text-lg" data-testid="loading-profile">Carregando perfil...</div>
      </div>
    );
  }

  // Only show error if auth is resolved and query has actually run and failed
  if (authenticated && authUser && (isError || !user)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="text-primary-foreground text-lg mb-4" data-testid="error-profile">
            Erro ao carregar perfil
          </div>
          <button 
            onClick={() => setLocation("/dashboard")}
            className="text-primary-foreground underline"
            data-testid="button-back-dashboard"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      title: "Informações Pessoais",
      icon: UserIcon,
      action: () => setLocation("/profile/edit"),
      hasArrow: true
    },
    {
      title: "Segurança da Conta",
      icon: Shield,
      action: () => setLocation("/profile/security"),
      hasArrow: true
    },
    {
      title: "Notificações",
      icon: Bell,
      action: () => setLocation("/profile/notifications"),
      hasArrow: true
    },
    {
      title: "Configurações do Aplicativo",
      icon: Smartphone,
      action: () => setLocation("/profile/settings"),
      hasArrow: true
    },
    {
      title: "Categorias de Gastos",
      icon: Tag,
      action: () => setLocation("/profile/categories"),
      hasArrow: true
    },
    {
      title: "Ajuda e Suporte",
      icon: HelpCircle,
      action: () => setLocation("/profile/help"),
      hasArrow: true
    }
  ];

  const handleLogout = () => {
    logout();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
    setLocation("/login");
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary">
      {/* Header */}
      <div className="bg-primary/80 backdrop-blur-sm border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">Perfil</h1>
              <p className="text-primary-foreground/80">Gerencie sua conta e preferências</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20" data-testid="avatar-user">
                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h2 className="text-2xl font-bold" data-testid="text-user-name">{user.name}</h2>
                <p className="text-muted-foreground flex items-center gap-2 mt-1" data-testid="text-user-email">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
                <p className="text-sm text-muted-foreground mt-2" data-testid="text-user-join-date">
                  Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </p>
              </div>

              <Button 
                variant="outline"
                size="sm"
                onClick={() => setLocation("/profile/edit")}
                className="ml-auto"
                data-testid="button-edit-profile"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="fin-card" data-testid="card-user-id">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ID do Usuário</p>
                  <p className="font-semibold text-sm" data-testid="text-user-id">{String(user.id).slice(0, 8)}...</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="fin-card" data-testid="card-user-created">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Conta Criada</p>
                  <p className="font-semibold text-sm" data-testid="text-user-created-at">
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Menu Options */}
        <Card className="fin-card">
          <CardHeader>
            <CardTitle>Geral</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-6 py-4 hover:bg-muted/50 transition-colors text-left"
                  data-testid={`button-menu-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="flex-1 font-medium">{item.title}</span>
                  {item.hasArrow && (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Card className="fin-card">
          <CardContent className="p-6">
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="w-full border-destructive text-destructive hover:bg-destructive/10"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </CardContent>
        </Card>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-4 gap-1">
              <button 
                onClick={() => setLocation("/dashboard")}
                className="nav-item"
                data-testid="nav-home"
              >
                <Home className="w-5 h-5" />
                <span className="text-sm">Home</span>
              </button>
              <button 
                onClick={() => setLocation("/bills")}
                className="nav-item"
                data-testid="nav-bills"
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-sm">Contas</span>
              </button>
              <button 
                onClick={() => setLocation("/reports")}
                className="nav-item"
                data-testid="nav-reports"
              >
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm">Relatórios</span>
              </button>
              <button className="nav-item active" data-testid="nav-profile">
                <UserIcon className="w-5 h-5" />
                <span className="text-sm">Perfil</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;