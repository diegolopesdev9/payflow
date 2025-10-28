import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BottomNavigation } from "@/components/BottomNavigation";
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
import { Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth, fetchWithAuth } from "@/lib/auth";
import type { Bill, Category } from "../../shared/schema";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const [location, setLocation] = useLocation();
  const { user, authenticated, loading } = useAuth();
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // State for quick bill form
  const [showQuickBillForm, setShowQuickBillForm] = useState(false);
  const [quickBillData, setQuickBillData] = useState({
    name: "",
    amount: "",
    dueDate: "",
    categoryId: "",
    description: "",
  });
  const [isQuickBillSubmitting, setIsQuickBillSubmitting] = useState(false);


  // Auth is now handled by ProtectedRoute wrapper

  // Fetch all bills for calculations
  const { data: allBills = [], isLoading: billsLoading, isError: billsError } = useQuery<Bill[]>({
    queryKey: ['/api/bills'],
    queryFn: async () => {
      const response = await fetchWithAuth(`/api/bills`);
      if (!response.ok) throw new Error('Failed to fetch bills');
      const json = await response.json();
      const data = Array.isArray(json) ? json : (json?.bills ?? []);

      // DEBUG: Verificar estrutura dos dados
      console.log('📊 [Dashboard] Bills recebidos:', data);
      console.log('📊 [Dashboard] Primeira bill:', data[0]);
      console.log('📊 [Dashboard] Keys da primeira bill:', data[0] ? Object.keys(data[0]) : 'nenhuma');

      return data;
    },
    enabled: authenticated === true && !!user?.id,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Fetch upcoming bills
  const { data: upcomingData = [], isLoading: upcomingLoading, isError: upcomingError } = useQuery<Bill[]>({
    queryKey: ['/api/bills/upcoming'],
    queryFn: async () => {
      const response = await fetchWithAuth(`/api/bills/upcoming`);
      if (!response.ok) throw new Error('Failed to fetch upcoming bills');
      const json = await response.json();
      return Array.isArray(json) ? json : (json?.upcoming ?? []);
    },
    enabled: authenticated === true && !!user?.id,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Fetch categories for mapping
  const { data: categories = [], isLoading: categoriesLoading, isError: categoriesError } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetchWithAuth(`/api/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const json = await response.json();
      return Array.isArray(json) ? json : (json?.categories ?? []);
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
        const dueDate = new Date(bill.due_date);
        return dueDate >= today && dueDate <= nextWeek && !bill.is_paid;
      })
      .reduce((sum, bill) => sum + (bill.amount / 100), 0); // Convert from cents
  };

  // Function to calculate weekly expenses based on real bills grouped by day of week
  const calculateWeeklyExpenses = (bills: Bill[]) => {
    const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Domingo
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const expenses = Array(7).fill(0);

    bills.forEach((bill: any) => {
      const billDate = new Date(bill.due_date || bill.dueDate);

      // Verifica se está na semana atual
      if (billDate >= startOfWeek && billDate <= endOfWeek) {
        const dayOfWeek = billDate.getDay(); // 0 = Dom, 1 = Seg, etc
        expenses[dayOfWeek] += bill.amount / 100; // Converter de centavos
      }
    });

    const weeklyData = daysOfWeek.map((day, index) => {
      const targetDate = new Date(startOfWeek);
      targetDate.setDate(startOfWeek.getDate() + index);

      return {
        day,
        date: targetDate.getDate(),
        amount: expenses[index]
      };
    });

    console.log('📊 [Dashboard] Bills total:', bills.length);
    console.log('📊 [Dashboard] Weekly expenses:', expenses);
    console.log('📊 [Dashboard] Bills na semana:', bills.filter((bill: any) => {
      const billDate = new Date(bill.dueDate || bill.due_date);
      return billDate >= startOfWeek && billDate <= endOfWeek;
    }).length);

    return weeklyData;
  };

  // Calcula variação percentual entre dois valores
  const calculatePercentageChange = (current: number, previous: number): number | null => {
    if (previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  // Calcula total da semana passada (7-14 dias atrás)
  const calculatePreviousWeekTotal = (bills: Bill[]): number => {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
    const fourteenDaysAgo = new Date(today.getTime() - (14 * 24 * 60 * 60 * 1000));

    return bills
      .filter(bill => {
        const dueDate = new Date(bill.due_date);
        return dueDate >= fourteenDaysAgo && dueDate < sevenDaysAgo && !bill.is_paid;
      })
      .reduce((sum, bill) => sum + (bill.amount / 100), 0);
  };

  // Calcula totais do mês anterior
  const calculatePreviousMonthTotals = (bills: Bill[]): { pending: number; paid: number } => {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const lastMonthBills = bills.filter(bill => {
      const dueDate = new Date(bill.due_date);
      return dueDate >= lastMonth && dueDate <= lastMonthEnd;
    });

    const pending = lastMonthBills
      .filter(bill => !bill.is_paid)
      .reduce((sum, bill) => sum + (bill.amount / 100), 0);

    const paid = lastMonthBills
      .filter(bill => bill.is_paid)
      .reduce((sum, bill) => sum + (bill.amount / 100), 0);

    return { pending, paid };
  };

  // Calculate statistics from all bills
  const pending = allBills.filter(bill => !bill.is_paid);
  const paid = allBills.filter(bill => bill.is_paid);

  const totalToPay = pending.reduce((sum, bill) => sum + (bill.amount / 100), 0); // Convert from cents
  const totalPaid = paid.reduce((sum, bill) => sum + (bill.amount / 100), 0); // Convert from cents

  // Calculate real weekly total from actual bills - MOVIDO PARA ANTES
  const weeklyTotalCalculated = calculateRealWeeklyTotal(allBills);

  // Calcular variações percentuais
  const previousWeekTotal = calculatePreviousWeekTotal(allBills);
  const weeklyChange = calculatePercentageChange(weeklyTotalCalculated, previousWeekTotal);

  const previousMonthTotals = calculatePreviousMonthTotals(allBills);
  const totalToPayChange = calculatePercentageChange(totalToPay, previousMonthTotals.pending);
  const totalPaidChange = calculatePercentageChange(totalPaid, previousMonthTotals.paid);

  // Process upcoming bills with icons and days left
  const upcomingBills = upcomingData.slice(0, 5).map(bill => {
    const category = categoryMap.get(bill.category_id);
    const categoryName = category?.name ?? 'Sem categoria';
    const dueDate = bill.dueDate ? new Date(bill.dueDate) : null;
    const today = new Date();
    const daysLeft = dueDate ? Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return {
      ...bill,
      name: bill.name || bill.description, // Use name field from schema
      categoryName,
      daysLeft,
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

  // Show loading while data is loading
  if (billsLoading || upcomingLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary flex items-center justify-center">
        <div className="text-primary-foreground text-lg" data-testid="loading-dashboard">Carregando dados...</div>
      </div>
    );
  }

  // Show error state if any queries failed
  if (!billsLoading && !upcomingLoading && !categoriesLoading && (billsError || upcomingError || categoriesError)) {
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

  // Handle quick bill form submission
  const handleQuickBillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!quickBillData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe o nome da conta.",
        variant: "destructive",
      });
      return;
    }

    if (!quickBillData.amount || parseFloat(quickBillData.amount) <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, informe um valor maior que zero.",
        variant: "destructive",
      });
      return;
    }

    if (!quickBillData.dueDate) {
      toast({
        title: "Data obrigatória",
        description: "Por favor, informe a data de vencimento.",
        variant: "destructive",
      });
      return;
    }

    setIsQuickBillSubmitting(true);

    try {
      const billData = {
        name: quickBillData.name,
        amount: Math.round(parseFloat(quickBillData.amount) * 100),
        dueDate: quickBillData.dueDate,
        categoryId: quickBillData.categoryId || null,
        description: quickBillData.description || null,
        isPaid: false,
      };

      const response = await fetchWithAuth("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(billData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create bill");
      }

      toast({
        title: "Conta adicionada!",
        description: "Nova despesa registrada com sucesso.",
      });

      setShowQuickBillForm(false);
      setQuickBillData({ name: "", amount: "", dueDate: "", categoryId: "", description: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bills/upcoming"] });
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Não foi possível adicionar a despesa.",
        variant: "destructive",
      });
    } finally {
      setIsQuickBillSubmitting(false);
    }
  };


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
              onClick={() => setShowQuickBillForm(true)} // Changed to open quick bill form
              className="btn-secondary-financial"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Conta
            </Button>
          </div>
        </div>
      </div>

      {showQuickBillForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Adicionar Nova Conta</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleQuickBillSubmit} className="space-y-4">
                <div>
                  <label htmlFor="quick-bill-name" className="block text-sm font-medium text-foreground">Nome da Conta</label>
                  <input
                    id="quick-bill-name"
                    type="text"
                    value={quickBillData.name}
                    onChange={(e) => setQuickBillData({ ...quickBillData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-border px-3 py-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="quick-bill-amount" className="block text-sm font-medium text-foreground">Valor (R$)</label>
                  <input
                    id="quick-bill-amount"
                    type="number"
                    step="0.01"
                    value={quickBillData.amount}
                    onChange={(e) => setQuickBillData({ ...quickBillData, amount: e.target.value })}
                    className="mt-1 block w-full rounded-md border-border px-3 py-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="quick-bill-due-date" className="block text-sm font-medium text-foreground">Data de Vencimento</label>
                  <input
                    id="quick-bill-due-date"
                    type="date"
                    value={quickBillData.dueDate}
                    onChange={(e) => setQuickBillData({ ...quickBillData, dueDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-border px-3 py-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="quick-bill-category" className="block text-sm font-medium text-foreground">Categoria</label>
                  <select
                    id="quick-bill-category"
                    value={quickBillData.categoryId}
                    onChange={(e) => setQuickBillData({ ...quickBillData, categoryId: e.target.value })}
                    className="mt-1 block w-full rounded-md border-border px-3 py-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="quick-bill-description" className="block text-sm font-medium text-foreground">Descrição</label>
                  <textarea
                    id="quick-bill-description"
                    value={quickBillData.description}
                    onChange={(e) => setQuickBillData({ ...quickBillData, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-border px-3 py-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowQuickBillForm(false)} disabled={isQuickBillSubmitting}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isQuickBillSubmitting}>
                    {isQuickBillSubmitting ? "Salvando..." : "Salvar Conta"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Weekly Expenses Card */}
        <Card className="stat-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Despesas Semanais</CardTitle>
              {weeklyChange !== null && (
                <Badge
                  variant="outline"
                  className={weeklyChange >= 0
                    ? "bg-destructive/10 text-destructive border-destructive/20"
                    : "bg-success/10 text-success border-success/20"
                  }
                >
                  {weeklyChange >= 0 ? '+' : ''}{weeklyChange.toFixed(1)}%
                  {weeklyChange >= 0
                    ? <TrendingUp className="w-3 h-3 ml-1" />
                    : <TrendingDown className="w-3 h-3 ml-1" />
                  }
                </Badge>
              )}
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
                  {totalToPayChange !== null && (
                    <div className={`flex items-center gap-1 text-sm ${totalToPayChange >= 0 ? 'text-destructive' : 'text-success'}`}>
                      {totalToPayChange >= 0
                        ? <TrendingUp className="w-3 h-3" />
                        : <TrendingDown className="w-3 h-3" />
                      }
                      <span>{totalToPayChange >= 0 ? '+' : ''}{totalToPayChange.toFixed(1)}%</span>
                    </div>
                  )}
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
                  {totalPaidChange !== null && (
                    <div className={`flex items-center gap-1 text-sm ${totalPaidChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {totalPaidChange >= 0
                        ? <TrendingUp className="w-3 h-3" />
                        : <TrendingDown className="w-3 h-3" />
                      }
                      <span>{totalPaidChange >= 0 ? '+' : ''}{totalPaidChange.toFixed(1)}%</span>
                    </div>
                  )}
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
                          <div className="text-sm text-muted-foreground">
                            {categories.find((cat: any) => cat.id === (bill.category_id || bill.categoryId))?.name || 'Sem categoria'}
                          </div>
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

        <BottomNavigation />
      </div>
    </div>
  );
};

export default Dashboard;