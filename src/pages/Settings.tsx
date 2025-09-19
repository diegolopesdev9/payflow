import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft,
  Bell,
  Moon,
  Sun,
  Shield,
  Database,
  Download,
  Trash2,
  LogOut,
  Home,
  CreditCard,
  TrendingUp,
  User
} from "lucide-react";

const Settings = () => {
  const [location, setLocation] = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary">
      {/* Header */}
      <div className="bg-primary/80 backdrop-blur-sm border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/profile")}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">Configurações</h1>
              <p className="text-primary-foreground/80">Personalize sua experiência</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Appearance */}
        <Card className="fin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="w-5 h-5" />
              Aparência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Modo Escuro</Label>
                <p className="text-xs text-muted-foreground">
                  Ativar tema escuro para uma experiência mais confortável
                </p>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="fin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Notificações Gerais</Label>
                <p className="text-xs text-muted-foreground">
                  Receber notificações sobre vencimentos e lembretes
                </p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Notificações por E-mail</Label>
                <p className="text-xs text-muted-foreground">
                  Receber resumos e alertas por e-mail
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Notificações Push</Label>
                <p className="text-xs text-muted-foreground">
                  Receber notificações no dispositivo
                </p>
              </div>
              <Switch
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="fin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacidade e Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setLocation("/profile/edit")}
            >
              <User className="w-4 h-4 mr-2" />
              Alterar Senha
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
            >
              <Shield className="w-4 h-4 mr-2" />
              Configurações de Privacidade
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="fin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Gerenciar Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Dados
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start text-destructive border-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Todos os Dados
            </Button>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="fin-card">
          <CardContent className="pt-6 space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start text-destructive border-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair da Conta
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
              >
                <Home className="w-5 h-5" />
                <span className="text-sm">Home</span>
              </button>
              <button 
                onClick={() => setLocation("/bills")}
                className="nav-item"
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-sm">Contas</span>
              </button>
              <button 
                onClick={() => setLocation("/reports")}
                className="nav-item"
              >
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm">Relatórios</span>
              </button>
              <button 
                onClick={() => setLocation("/profile")}
                className="nav-item active"
              >
                <User className="w-5 h-5" />
                <span className="text-sm">Perfil</span>
              </button>
            </div>
          </div>
        </div>

        {/* Add bottom padding to prevent content being hidden by navigation */}
        <div className="h-20" />
      </div>
    </div>
  );
};

export default Settings;