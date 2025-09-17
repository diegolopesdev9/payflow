import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Bell, Mail, Smartphone, Shield, AlertTriangle } from "lucide-react";

const Notifications = () => {
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState({
    billReminders: true,
    paymentConfirmations: true,
    suspiciousActivity: true,
    appUpdates: false,
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    monthlyReports: false
  });

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const notificationGroups = [
    {
      title: "Alertas",
      icon: Bell,
      items: [
        {
          key: "billReminders",
          title: "Contas a vencer",
          description: "Lembretes para contas a vencer",
          value: settings.billReminders
        },
        {
          key: "paymentConfirmations",
          title: "Pagamentos confirmados",
          description: "Notificações de pagamentos confirmados",
          value: settings.paymentConfirmations
        },
        {
          key: "suspiciousActivity",
          title: "Atividade suspeita",
          description: "Alertas para transações incomuns",
          value: settings.suspiciousActivity
        }
      ]
    },
    {
      title: "Aplicativo",
      icon: Smartphone,
      items: [
        {
          key: "appUpdates",
          title: "Novidades do aplicativo",
          description: "Notificações de novas funcionalidades",
          value: settings.appUpdates
        },
        {
          key: "weeklyReports",
          title: "Relatórios semanais",
          description: "Resumo semanal dos seus gastos",
          value: settings.weeklyReports
        },
        {
          key: "monthlyReports",
          title: "Relatórios mensais",
          description: "Análise mensal detalhada",
          value: settings.monthlyReports
        }
      ]
    },
    {
      title: "Canais",
      icon: Mail,
      items: [
        {
          key: "emailNotifications",
          title: "Notificações por e-mail",
          description: "Receber notificações via e-mail",
          value: settings.emailNotifications
        },
        {
          key: "pushNotifications",
          title: "Notificações push",
          description: "Notificações no dispositivo",
          value: settings.pushNotifications
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary">
      {/* Header */}
      <div className="bg-primary/80 backdrop-blur-sm border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/profile")}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">Notificações</h1>
              <p className="text-primary-foreground/80">Configure suas preferências de notificação</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {notificationGroups.map((group, groupIndex) => (
          <Card key={groupIndex} className="fin-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <group.icon className="w-5 h-5" />
                {group.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {group.items.map((item, index) => (
                <div key={item.key}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <Switch
                      checked={item.value}
                      onCheckedChange={(checked) => updateSetting(item.key, checked)}
                    />
                  </div>
                  {index < group.items.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {/* Security Notice */}
        <Card className="fin-card border-warning/20 bg-warning/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center mt-1">
                <AlertTriangle className="w-4 h-4 text-warning" />
              </div>
              <div>
                <h4 className="font-medium text-warning mb-2">Importante</h4>
                <p className="text-sm text-muted-foreground">
                  Recomendamos manter as notificações de segurança ativadas para proteger sua conta 
                  contra atividades suspeitas e garantir que você seja informado sobre vencimentos importantes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Notifications;