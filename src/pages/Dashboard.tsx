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
import { useLocation, Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import type { Bill, Category } from "../../shared/schema";

const Dashboard = () => {
  const [location, setLocation] = useLocation();
  const { user, authenticated, loading } = useAuth();
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  useEffect(() => {
    if (authenticated === false) {
      setLocation("/login");
    }
  }, [authenticated, setLocation]);

  // Fetch all bills for calculations
  const { data: allBills = [], isLoading: billsLoading, isError: billsError } = useQuery<Bill[]>({
    queryKey: ['/api/bills'],
    queryFn: async () => {
      const response = await fetchWithAuth(`/api/bills?userId=${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch bills');
      return response.json();
    },
    enabled: authenticated === true && !!user?.id,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch upcoming bills
  const { data: upcomingData = [], isLoading: upcomingLoading, isError: upcomingError } = useQuery<Bill[]>({
    queryKey: ['/api/bills/upcoming'],
    queryFn: async () => {
      const response = await fetchWithAuth(`/api/bills/upcoming?userId=${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch upcoming bills');
      return response.json();
    },
    enabled: authenticated === true && !!user?.id,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch categories for mapping
  const { data: categories = [], isLoading: categoriesLoading, isError: categoriesError } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetchWithAuth(`/api/categories?userId=${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
    enabled: authenticated === true && !!user?.id,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Create category mapping
  const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

  // Helper function for category icons
  const getIconForCategory = (category: string) => {
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

  // Function to calculate real weekly total from bills due in next 7 days
  const calculateRealWeeklyTotal = (bills: Bill[]) => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));

    return bills
      .filter(bill => {
        const dueDate = new Date(bill.dueDate);
        return dueDate >= today && dueDate <= nextWeek && !bill.isPaid;
      })
      .reduce((sum, bill) => sum + (bill.amount / 100), 0); // Convert from cents
  };

  // Function to calculate weekly expenses based on real bills grouped by day of week
  const calculateWeeklyExpenses = (bills: Bill[]) => {
    const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const today = new Date();

    const weeklyData = daysOfWeek.map((day, index) => {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + index);

      const dayBills = bills.filter(bill => {
        const billDate = new Date(bill.dueDate);
        return billDate.toDateString() === targetDate.toDateString() && !bill.isPaid;
      });

      const amount = dayBills.reduce((sum, bill) => sum + (bill.amount / 100), 0); // Convert from cents

      return {
        day,
        date: targetDate.getDate(),
        amount
      };
    });
    return weeklyData;
  };

  // Calculate statistics from all bills
  const pending = allBills.filter(bill => !bill.isPaid);
  const paid = allBills.filter(bill => bill.isPaid);

  const totalToPay = pending.reduce((sum, bill) => sum + (bill.amount / 100), 0); // Convert from cents
  const totalPaid = paid.reduce((sum, bill) => sum + (bill.amount / 100), 0); // Convert from cents

  // Calculate real weekly total from actual bills
  const weeklyTotalCalculated = calculateRealWeeklyTotal(allBills);

  // Process upcoming bills with icons and days left
  const upcomingBills = upcomingData.slice(0, 5).map(bill => {
    const category = categoryMap.get(bill.categoryId);
    const categoryName = category?.name ?? 'Sem categoria';
    return {
      ...bill,
      name: bill.name || bill.description, // Use name field from schema
      categoryName,
      daysLeft: Math.ceil((new Date(bill.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      icon: getIconForCategory(categoryName)
    };
  });

  // Set weekly total when calculated
  useEffect(() => {
    if (weeklyTotalCalculated !== weeklyTotal) {
      setWeeklyTotal(weeklyTotalCalculated);
    }
  }, [weeklyTotalCalculated, weeklyTotal]);


  const weeklyExpenses = (billsLoading || upcomingLoading || categoriesLoading) ? [] : calculateWeeklyExpenses(allBills);

  const maxAmount = Math.max(...weeklyExpenses.map(d => d.amount), 1); // Avoid zero division

  if (authenticated === false) {
    return null;
  }

  // Show loading while auth is resolving
  if (loading || authenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary flex items-center justify-center">
        <div className="text-primary-foreground text-lg" data-testid="loading-dashboard">Carregando dashboard...</div>
      </div>
    );
  }

  // Show loading while data is loading (only if authenticated)
  if (authenticated && user && (billsLoading || upcomingLoading || categoriesLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary flex items-center justify-center">
        <div className="text-primary-foreground text-lg" data-testid="loading-dashboard">Carregando dados...</div>
      </div>
    );
  }

  // Show error state if any queries failed (but only if we're authenticated and not loading)
  if (authenticated && user && !billsLoading && !upcomingLoading && !categoriesLoading && (billsError || upcomingError || categoriesError)) {
    console.error('Dashboard query errors:', { billsError, upcomingError, categoriesError });
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary flex items-center justify-center">
        <div className="text-center text-primary-foreground">
          <div className="text-lg mb-4" data-testid="error-dashboard">Erro ao carregar dados do dashboard</div>
          <Button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/bills'] });
              queryClient.invalidateQueries({ queryKey: ['/api/bills/upcoming'] });
              queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
            }}
            variant="secondary"
            data-testid="button-retry"
          >
            Tentar novamente
          </Button>
        </div>
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
                            height: maxAmount > 1 ? `${(day.amount / maxAmount) * 100}px` : '0px',
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
                          <div className="text-sm text-muted-foreground">{bill.categoryName}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-semibold">
                          R$ {(bill.amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
              <Link to="/bills" className="nav-item">
                <CreditCard className="w-5 h-5" />
                <span className="text-sm">Contas</span>
              </Link>
              <Link to="/reports" className="nav-item">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm">Relatórios</span>
              </Link>
              <Link to="/profile" className="nav-item">
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