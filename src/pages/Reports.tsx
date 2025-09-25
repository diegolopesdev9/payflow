import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Bill, Category } from "../../shared/schema";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  PieChart,
  Calendar,
  DollarSign,
  Home,
  CreditCard,
  User,
  Filter
} from "lucide-react";

const Reports = () => {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("mensal");
  const { user, authenticated } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (authenticated === false) {
      setLocation("/login");
    }
  }, [authenticated, setLocation]);

  // Fetch bills for analysis
  const { data: bills = [], isLoading: billsLoading, isError: billsError } = useQuery<Bill[]>({
    queryKey: ['/api/bills'],
    enabled: !!user?.id,
  });

  // Fetch categories for mapping
  const { data: categories = [], isLoading: categoriesLoading, isError: categoriesError } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    enabled: !!user?.id,
  });

  if (authenticated === false) {
    return null;
  }

  // Show loading while auth is resolving or data is loading
  if (authenticated === null || (authenticated && !user) || billsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary flex items-center justify-center">
        <div className="text-primary-foreground text-lg" data-testid="loading-reports">Carregando relatórios...</div>
      </div>
    );
  }

  // Show error if bills or categories failed to load
  if (authenticated && user && (billsError || categoriesError)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="text-primary-foreground text-lg mb-4" data-testid="error-reports">
            Erro ao carregar dados dos relatórios
          </div>
          <button 
            onClick={() => setLocation("/dashboard")}
            className="text-primary-foreground underline"
            data-testid="button-back-dashboard"
          >
            Voltar para Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Process bills data for analytics
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // Create category mapping
  const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
  
  // Generate monthly totals for the last 12 months from real bills data
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const monthlyTotals = new Map<string, number>();
  
  // Initialize all months to 0
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentYear, i, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    monthlyTotals.set(key, 0);
  }
  
  // Process each bill and add to appropriate month
  bills.forEach(bill => {
    const billDate = new Date(bill.dueDate);
    const key = `${billDate.getFullYear()}-${billDate.getMonth()}`;
    const currentAmount = monthlyTotals.get(key) || 0;
    monthlyTotals.set(key, currentAmount + (bill.amount / 100));
  });
  
  // Create the monthly expenses array for the chart using real data
  const monthlyExpenses = monthNames.map((month, index) => {
    const key = `${currentYear}-${index}`;
    return {
      month,
      amount: Math.round(monthlyTotals.get(key) || 0)
    };
  });
  
  const maxAmount = Math.max(...monthlyExpenses.map(m => m.amount), 1); // Ensure at least 1 to avoid division by 0
  
  // Calculate current month totals
  const currentMonthBills = bills.filter(bill => {
    const billDate = new Date(bill.dueDate);
    return billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear;
  });
  
  const monthlyTotal = currentMonthBills.reduce((sum, bill) => sum + bill.amount, 0) / 100;
  
  // Calculate previous month total for comparison
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const previousMonthKey = `${previousYear}-${previousMonth}`;
  const previousMonthTotal = monthlyTotals.get(previousMonthKey) || 0;
  
  // Calculate real month-over-month change
  const monthlyChange = previousMonthTotal > 0 
    ? Math.round(((monthlyTotal - previousMonthTotal) / previousMonthTotal) * 100)
    : 0;
  
  // Calculate daily average
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dailyAverage = monthlyTotal / daysInMonth;
  
  // Group bills by category, including uncategorized bills
  const categoryTotals = new Map<string, number>();
  
  currentMonthBills.forEach(bill => {
    let categoryName = 'Sem categoria';
    if (bill.categoryId) {
      const category = categoryMap.get(bill.categoryId);
      categoryName = category?.name || 'Sem categoria';
    }
    categoryTotals.set(categoryName, (categoryTotals.get(categoryName) || 0) + bill.amount / 100);
  });
  
  // Convert to array with percentages
  const categoryAnalysis = Array.from(categoryTotals.entries()).map(([name, amount]) => ({
    name,
    amount,
    percentage: monthlyTotal > 0 ? Math.round((amount / monthlyTotal) * 100) : 0,
    color: "bg-primary" // Default color, can be enhanced later
  })).sort((a, b) => b.amount - a.amount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary">
      {/* Header */}
      <div className="bg-primary/80 backdrop-blur-sm border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground" data-testid="heading-reports">Relatórios</h1>
              <p className="text-primary-foreground/80">Análise detalhada dos seus gastos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Tabs with Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Period Tabs */}
          <Card className="fin-card" data-testid="card-period-tabs">
            <CardContent className="p-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="mensal" data-testid="tab-monthly">Mensal</TabsTrigger>
                <TabsTrigger value="anual" data-testid="tab-yearly">Anual</TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          <TabsContent value="mensal" className="space-y-6">
            {/* Monthly Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="stat-card" data-testid="card-monthly-overview">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Despesas Mensais
                    </CardTitle>
                    <Badge 
                      variant="outline" 
                      className={monthlyChange >= 0 
                        ? "bg-success/10 text-success border-success/20" 
                        : "bg-destructive/10 text-destructive border-destructive/20"
                      } 
                      data-testid="badge-monthly-change"
                    >
                      {monthlyChange >= 0 ? '+' : ''}{monthlyChange}% 
                      {monthlyChange >= 0 ? <TrendingUp className="w-3 h-3 ml-1" /> : <TrendingDown className="w-3 h-3 ml-1" />}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-3xl font-bold text-foreground" data-testid="text-monthly-total">
                        R$ {monthlyTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <p className="text-muted-foreground">Mês atual</p>
                    </div>

                    {/* Monthly Chart */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-6 gap-1">
                        {monthlyExpenses.slice(0, 6).map((month, index) => (
                          <div key={month.month} className="text-center">
                            <div className="text-xs text-muted-foreground mb-1">{month.month}</div>
                            <div 
                              className="bg-secondary rounded-t-md transition-all duration-500 ease-out min-h-[10px]"
                              style={{ 
                                height: `${(month.amount / maxAmount) * 40}px`,
                                animationDelay: `${index * 100}ms`
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-6 gap-1">
                        {monthlyExpenses.slice(6, 12).map((month, index) => (
                          <div key={month.month} className="text-center">
                            <div className="text-xs text-muted-foreground mb-1">{month.month}</div>
                            <div 
                              className="bg-secondary rounded-t-md transition-all duration-500 ease-out min-h-[10px]"
                              style={{ 
                                height: `${(month.amount / maxAmount) * 40}px`,
                                animationDelay: `${(index + 6) * 100}ms`
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="stat-card" data-testid="card-category-breakdown">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Gastos por Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-3xl font-bold text-foreground" data-testid="text-category-total">
                        R$ {monthlyTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <p className="text-muted-foreground">Total do mês</p>
                    </div>

                    <div className="space-y-3">
                      {categoryAnalysis.length > 0 ? categoryAnalysis.map((category) => (
                        <div key={category.name} className="space-y-2" data-testid={`category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{category.name}</span>
                            <span className="text-muted-foreground">
                              R$ {category.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={category.percentage} 
                              className="flex-1 h-2"
                            />
                            <span className="text-xs text-muted-foreground w-10">
                              {category.percentage}%
                            </span>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-4" data-testid="text-no-categories">
                          <p className="text-muted-foreground">Nenhuma despesa por categoria neste mês</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="stat-card" data-testid="card-total-spent">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold" data-testid="text-total-spent">
                    R$ {monthlyTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-muted-foreground">Total gasto</div>
                </CardContent>
              </Card>

              <Card className="stat-card" data-testid="card-daily-average">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="text-2xl font-bold" data-testid="text-daily-average">
                    R$ {dailyAverage.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-muted-foreground">Média diária</div>
                </CardContent>
              </Card>

              <Card className="stat-card" data-testid="card-monthly-change">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-success" />
                  </div>
                  <div 
                    className={`text-2xl font-bold ${monthlyChange >= 0 ? 'text-success' : 'text-destructive'}`} 
                    data-testid="text-monthly-change"
                  >
                    {monthlyChange >= 0 ? '+' : ''}{monthlyChange}%
                  </div>
                  <div className="text-sm text-muted-foreground">vs mês anterior</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="anual" className="space-y-6">
            <Card className="stat-card" data-testid="card-yearly-placeholder">
              <CardContent className="p-12 text-center">
                <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2" data-testid="text-yearly-title">Relatório Anual</h3>
                <p className="text-muted-foreground" data-testid="text-yearly-description">
                  Visualização dos gastos anuais em desenvolvimento
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-4 gap-1">
              <button 
                onClick={() => setLocation("/dashboard")}
                className="nav-item"
                data-testid="nav-dashboard"
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
              <button className="nav-item active" data-testid="nav-reports">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm">Relatórios</span>
              </button>
              <button 
                onClick={() => setLocation("/profile")}
                className="nav-item"
                data-testid="nav-profile"
              >
                <User className="w-5 h-5" />
                <span className="text-sm">Perfil</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;