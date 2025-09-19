import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  CreditCard,
  Wallet,
  Home,
  Plus
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

const Dashboard = () => {
  const [location, setLocation] = useLocation();
  const [weekProgress] = useState(65);

  const weeklyExpenses = [
    { day: "Seg", amount: 180 },
    { day: "Ter", amount: 220 },
    { day: "Qua", amount: 150 },
    { day: "Qui", amount: 200 },
    { day: "Sex", amount: 280 },
    { day: "Sáb", amount: 120 },
    { day: "Dom", amount: 98 },
  ];

  const upcomingBills = [
    { id: 1, name: "Aluguel", amount: 500, daysLeft: 2, category: "Moradia", icon: Home },
    { id: 2, name: "Internet", amount: 100, daysLeft: 5, category: "Telecom", icon: CreditCard },
    { id: 3, name: "Cartão de Crédito", amount: 250, daysLeft: 7, category: "Cartão", icon: CreditCard },
    { id: 4, name: "Academia", amount: 50, daysLeft: 10, category: "Saúde", icon: TrendingUp },
    { id: 5, name: "Streaming", amount: 20, daysLeft: 12, category: "Entretenimento", icon: CreditCard },
  ];

  const maxAmount = Math.max(...weeklyExpenses.map(d => d.amount));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary">
      {/* Header */}
      <div className="bg-primary/80 backdrop-blur-sm border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">Visão Geral</h1>
              <p className="text-primary-foreground/80">Seus gastos desta semana</p>
            </div>
            <Button className="btn-secondary-financial">
              <Plus className="w-4 h-4 mr-2" />
              Nova Conta
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Weekly Expenses Card */}
        <Card className="stat-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Despesas Semanais</CardTitle>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                +15% <TrendingUp className="w-3 h-3 ml-1" />
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="text-3xl font-bold text-foreground mb-2">R$ 1.250</div>
                <p className="text-muted-foreground">Esta semana</p>
              </div>

              {/* Chart */}
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-2">
                  {weeklyExpenses.map((day, index) => (
                    <div key={day.day} className="text-center">
                      <div className="text-xs text-muted-foreground mb-2">{day.day}</div>
                      <div className="relative">
                        <div 
                          className="bg-secondary rounded-t-md transition-all duration-500 ease-out min-h-[20px]"
                          style={{ 
                            height: `${(day.amount / maxAmount) * 100}px`,
                            animationDelay: `${index * 100}ms`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <div className="text-sm text-muted-foreground">Total de despesas</div>
                  <div className="text-lg font-semibold">R$ 1.250</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Média diária</div>
                  <div className="text-lg font-semibold">R$ 178,57</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Wallet className="w-4 h-4" />
                    <span className="text-sm">Total a Pagar</span>
                  </div>
                  <div className="text-2xl font-bold value-negative">R$ 850</div>
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <TrendingDown className="w-3 h-3" />
                    <span>-5%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">Total Pago</span>
                  </div>
                  <div className="text-2xl font-bold value-positive">R$ 400</div>
                  <div className="flex items-center gap-1 text-sm text-success">
                    <TrendingUp className="w-3 h-3" />
                    <span>+10%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Bills */}
        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="text-lg">Próximas Contas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingBills.map((bill) => {
                const Icon = bill.icon;
                const isUrgent = bill.daysLeft <= 3;
                
                return (
                  <div 
                    key={bill.id} 
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
                      isUrgent ? 'bg-destructive/5 border-destructive/20' : 'bg-card border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isUrgent ? 'bg-destructive/10' : 'bg-primary/10'
                      }`}>
                        <Icon className={`w-5 h-5 ${isUrgent ? 'text-destructive' : 'text-primary'}`} />
                      </div>
                      <div>
                        <div className="font-medium">{bill.name}</div>
                        <div className="text-sm text-muted-foreground">{bill.category}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold">R$ {bill.amount}</div>
                      <div className={`text-sm flex items-center gap-1 ${
                        isUrgent ? 'text-destructive' : 'text-muted-foreground'
                      }`}>
                        <Calendar className="w-3 h-3" />
                        <span>Vencimento em {bill.daysLeft} dias</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-4 gap-1">
              <button className="nav-item active">
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
                className="nav-item"
              >
                <Wallet className="w-5 h-5" />
                <span className="text-sm">Perfil</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;