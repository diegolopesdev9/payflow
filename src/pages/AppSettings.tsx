import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft,
  Smartphone,
  Moon,
  Sun,
  Globe,
  DollarSign,
  Vibrate,
  Volume2,
  Wifi,
  Database,
  Home,
  CreditCard,
  TrendingUp,
  User,
  HelpCircle
} from "lucide-react";

const AppSettings = () => {
  const [location, setLocation] = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("pt-br");
  const [currency, setCurrency] = useState("BRL");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);

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
              <h1 className="text-2xl font-bold text-primary-foreground">Configurações do Aplicativo</h1>
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
                  Ativar tema escuro para melhor visualização noturna
                </p>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card className="fin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Idioma e Região
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Idioma</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-br">Português (Brasil)</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Moeda</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real (R$)</SelectItem>
                  <SelectItem value="USD">Dólar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sound & Haptics */}
        <Card className="fin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Som e Vibração
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Sons do Aplicativo</Label>
                <p className="text-xs text-muted-foreground">
                  Reproduzir sons para notificações e ações
                </p>
              </div>
              <Switch
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Vibração</Label>
                <p className="text-xs text-muted-foreground">
                  Vibrar o dispositivo para alertas importantes
                </p>
              </div>
              <Switch
                checked={vibrationEnabled}
                onCheckedChange={setVibrationEnabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data & Sync */}
        <Card className="fin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Dados e Sincronização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Sincronização Automática</Label>
                <p className="text-xs text-muted-foreground">
                  Sincronizar dados automaticamente quando conectado
                </p>
              </div>
              <Switch
                checked={autoSync}
                onCheckedChange={setAutoSync}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Apenas Wi-Fi</Label>
                <p className="text-xs text-muted-foreground">
                  Sincronizar somente quando conectado ao Wi-Fi
                </p>
              </div>
              <Switch
                checked={wifiOnly}
                onCheckedChange={setWifiOnly}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Backup Automático</Label>
                <p className="text-xs text-muted-foreground">
                  Fazer backup dos dados automaticamente
                </p>
              </div>
              <Switch
                checked={autoBackup}
                onCheckedChange={setAutoBackup}
              />
            </div>
          </CardContent>
        </Card>

        {/* Storage */}
        <Card className="fin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Armazenamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Dados do aplicativo</span>
              <span className="text-sm text-muted-foreground">2.4 MB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Cache temporário</span>
              <span className="text-sm text-muted-foreground">1.2 MB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Backup local</span>
              <span className="text-sm text-muted-foreground">856 KB</span>
            </div>

            <Separator />

            <Button variant="outline" className="w-full">
              Limpar Cache
            </Button>
          </CardContent>
        </Card>
        
        {/* Help & Support */}
        <Card className="fin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Ajuda e Suporte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-left h-auto p-3"
              onClick={() => setLocation("/help")}
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5" />
                <div>
                  <div className="font-medium">Ajuda e Suporte</div>
                  <div className="text-xs text-muted-foreground">
                    Central de ajuda e documentação
                  </div>
                </div>
              </div>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start text-left h-auto p-3 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setLocation("/data-management")}
            >
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5" />
                <div>
                  <div className="font-medium">Gerenciar Dados</div>
                  <div className="text-xs text-muted-foreground">
                    Excluir e gerenciar dados do sistema
                  </div>
                </div>
              </div>
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

export default AppSettings;