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
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { fetchWithAuth, useAuth } from "@/lib/auth";

const Dashboard = () => {
  const [location, setLocation] = useLocation();
  const { user, authenticated } = useAuth();
  const [upcomingBills, setUpcomingBills] = useState([]);
  const [totalToPay, setTotalToPay] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authenticated) {
      setLocation("/login");
      return;
    }

    if (!user?.id) {
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Buscar próximas contas
        const upcomingResponse = await fetchWithAuth(`/api/bills/upcoming?userId=${user.id}&limit=5`);
        const upcomingData = await upcomingResponse.json();
        
        // Buscar todas as contas para calcular totais
        const allBillsResponse = await fetchWithAuth(`/api/bills?userId=${user.id}`);
        const allBills = await allBillsResponse.json();

        // Calcular estatísticas
        const pending = allBills.filter(bill => bill.status === 'pending');
        const paid = allBills.filter(bill => bill.status === 'paid');
        
        const totalToPay = pending.reduce((sum, bill) => sum + bill.amount, 0);
        const totalPaid = paid.reduce((sum, bill) => sum + bill.amount, 0);
        
        // Simular dados semanais baseados nas contas
        const weeklyTotal = Math.min(totalToPay, 1250);

        // Mapear dados das contas próximas com ícones
        const billsWithIcons = upcomingData.map(bill => ({
          ...bill,
          name: bill.description,
          daysLeft: Math.ceil((new Date(bill.dueDate) - new Date()) / (1000 * 60 * 60 * 24)),
          icon: getIconForCategory(bill.category)
        }));

        setUpcomingBills(billsWithIcons);
        setTotalToPay(totalToPay);
        setTotalPaid(totalPaid);
        setWeeklyTotal(weeklyTotal);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [authenticated, user?.id]);

  const getIconForCategory = (category) => {
    const iconMap = {
      'Moradia': Home,
      'Telecom': CreditCard,
      'Cartão': CreditCard,
      'Saúde': TrendingUp,
      'Entretenimento': CreditCard,
      'Utilidades': Home,
      'Alimentação': DollarSign,
      'Transporte': CreditCard,
      'Educação': TrendingUp,
      'Lazer': CreditCard,
    };
    return iconMap[category] || CreditCard;
  };

  const weeklyExpenses = [
    { day: "Seg", amount: Math.floor(weeklyTotal * 0.15) },
    { day: "Ter", amount: Math.floor(weeklyTotal * 0.18) },
    { day: "Qua", amount: Math.floor(weeklyTotal * 0.12) },
    { day: "Qui", amount: Math.floor(weeklyTotal * 0.16) },
    { day: "Sex", amount: Math.floor(weeklyTotal * 0.22) },
    { day: "Sáb", amount: Math.floor(weeklyTotal * 0.10) },
    { day: "Dom", amount: Math.floor(weeklyTotal * 0.07) },
  ];

  const maxAmount = Math.max(...weeklyExpenses.map(d => d.amount));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary flex items-center justify-center">
        <div className="text-primary-foreground text-lg">Carregando...</div>
      </div>
    );
  }

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
            <Button 
              onClick={() => setLocation("/new-bill")}
              className="btn-secondary-financial"
            >
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
                <div className="text-3xl font-bold text-foreground mb-2">
                  R$ {weeklyTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
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
                  <div className="text-lg font-semibold">
                    R$ {weeklyTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Média diária</div>
                  <div className="text-lg font-semibold">
                    R$ {(weeklyTotal / 7).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
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
                  <div className="text-2xl font-bold value-negative">
                    R$ {totalToPay.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
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
                  <div className="text-2xl font-bold value-positive">
                    R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
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
              {upcomingBills.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma conta próxima do vencimento</p>
                </div>
              ) : (
                upcomingBills.map((bill) => {
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
                      <div className="font-semibold">
                        R$ {bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className={`text-sm flex items-center gap-1 ${
                        isUrgent ? 'text-destructive' : 'text-muted-foreground'
                      }`}>
                        <Calendar className="w-3 h-3" />
                        <span>Vencimento em {bill.daysLeft} dias</span>
                      </div>
                    </div>
                  </div>
                );
              })
              )}
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