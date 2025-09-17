import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const Profile = () => {
  const navigate = useNavigate();
  
  const user = {
    name: "Sofia Almeida",
    email: "sofia.almeida@email.com",
    phone: "+55 11 98765-4321",
    address: "Rua das Flores, 123, Apto 45, São Paulo, SP",
    joinDate: "Janeiro 2024",
    avatar: "/api/placeholder/150/150"
  };

  const menuItems = [
    {
      title: "Informações Pessoais",
      icon: UserIcon,
      action: () => navigate("/profile/edit"),
      hasArrow: true
    },
    {
      title: "Segurança da Conta",
      icon: Shield,
      action: () => navigate("/profile/security"),
      hasArrow: true
    },
    {
      title: "Notificações",
      icon: Bell,
      action: () => navigate("/profile/notifications"),
      hasArrow: true
    },
    {
      title: "Configurações do Aplicativo",
      icon: Smartphone,
      action: () => navigate("/profile/settings"),
      hasArrow: true
    },
    {
      title: "Categorias de Gastos",
      icon: Tag,
      action: () => navigate("/profile/categories"),
      hasArrow: true
    },
    {
      title: "Ajuda e Suporte",
      icon: HelpCircle,
      action: () => navigate("/profile/help"),
      hasArrow: true
    }
  ];

  const handleLogout = () => {
    // In a real app, you would clear authentication tokens here
    navigate("/login");
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
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Membro desde {user.joinDate}
                </p>
              </div>

              <Button 
                variant="outline"
                size="sm"
                onClick={() => navigate("/profile/edit")}
                className="ml-auto"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="fin-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-semibold">{user.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="fin-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Endereço</p>
                  <p className="font-semibold text-sm">{user.address}</p>
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
                onClick={() => navigate("/dashboard")}
                className="nav-item"
              >
                <Home className="w-5 h-5" />
                <span className="text-sm">Home</span>
              </button>
              <button 
                onClick={() => navigate("/bills")}
                className="nav-item"
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-sm">Contas</span>
              </button>
              <button 
                onClick={() => navigate("/reports")}
                className="nav-item"
              >
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm">Relatórios</span>
              </button>
              <button className="nav-item active">
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