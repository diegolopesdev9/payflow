import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth, fetchWithAuth } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { BottomNavigation } from "@/components/BottomNavigation";
import {
  Plus,
  Calendar,
  DollarSign,
  Save,
  X,
} from "lucide-react";

const Dashboard = () => {
  const [location, setLocation] = useLocation();
  const { user, authenticated } = useAuth();
  const { toast } = useToast();
  const [showQuickBillForm, setShowQuickBillForm] = useState(false);
  const [isQuickBillSubmitting, setIsQuickBillSubmitting] = useState(false);
  const [quickBillData, setQuickBillData] = useState({
    name: "",
    amount: "",
    dueDate: "",
    categoryId: "",
    description: "",
  });
  const [periodFilter, setPeriodFilter] = useState('week');

  // Redirect if not authenticated
  useEffect(() => {
    if (authenticated === false) {
      setLocation("/login");
    }
  }, [authenticated, setLocation]);

  // Fetch bills
  const { data: bills = [], isLoading: billsLoading } = useQuery({
    queryKey: ['/api/bills'],
    queryFn: async () => {
      const response = await fetchWithAuth('/api/bills');
      if (!response.ok) throw new Error('Failed to fetch bills');
      return response.json();
    },
    enabled: authenticated === true && !!user?.id,
    staleTime: 0,
    refetchOnMount: true,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetchWithAuth('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
    enabled: authenticated === true && !!user?.id,
  });

  // Fetch upcoming bills
  const { data: upcomingBills = [] } = useQuery({
    queryKey: ['/api/bills/upcoming'],
    queryFn: async () => {
      const response = await fetchWithAuth('/api/bills/upcoming');
      if (!response.ok) throw new Error('Failed to fetch upcoming bills');
      return response.json();
    },
    enabled: authenticated === true && !!user?.id,
    staleTime: 0,
    refetchOnMount: true,
  });

  // Calculate weekly expenses - SIMPLIFICADO
  const calculateWeeklyExpenses = () => {
    if (!bills || bills.length === 0) return Array(7).fill(0);

    const today = new Date();
    const expenses = Array(7).fill(0);

    bills.forEach((bill: any) => {
      if (!bill.dueDate || !bill.amount) return;

      const billDate = new Date(bill.dueDate);
      const diffTime = today.getTime() - billDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays < 7) {
        const dayIndex = 6 - diffDays;
        expenses[dayIndex] += bill.amount / 100;
      }
    });

    return expenses;
  };

  const calculateMonthlyExpenses = () => {
    if (!bills || bills.length === 0) return Array(6).fill(0);

    const today = new Date();
    const expenses = Array(30).fill(0);

    bills.forEach((bill: any) => {
      if (!bill.dueDate || !bill.amount) return;

      const billDate = new Date(bill.dueDate);
      const diffTime = today.getTime() - billDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays < 30) {
        const index = 29 - diffDays;
        expenses[index] += bill.amount / 100;
      }
    });

    const grouped = [];
    for (let i = 0; i < 6; i++) {
      const start = i * 5;
      const end = start + 5;
      const sum = expenses.slice(start, end).reduce((acc, val) => acc + val, 0);
      grouped.push(sum);
    }

    return grouped;
  };

  const calculateYearlyExpenses = () => {
    if (!bills || bills.length === 0) return Array(12).fill(0);

    const today = new Date();
    const currentYear = today.getFullYear();
    const expenses = Array(12).fill(0);

    bills.forEach((bill: any) => {
      if (!bill.dueDate || !bill.amount) return;

      const billDate = new Date(bill.dueDate);

      if (billDate.getFullYear() === currentYear) {
        const month = billDate.getMonth();
        expenses[month] += bill.amount / 100;
      }
    });

    return expenses;
  };

  // Calculate totals - SIMPLIFICADO
  const calculateTotals = () => {
    if (!bills || bills.length === 0) return { totalToPay: 0, totalPaid: 0 };

    let totalToPay = 0;
    let totalPaid = 0;

    bills.forEach((bill: any) => {
      const amount = bill.amount / 100;
      if (bill.isPaid) {
        totalPaid += amount;
      } else {
        totalToPay += amount;
      }
    });

    return { totalToPay, totalPaid };
  };

  // Recalcular sempre que bills mudar
  const weeklyExpenses = calculateWeeklyExpenses();
  const monthlyExpenses = calculateMonthlyExpenses();
  const yearlyExpenses = calculateYearlyExpenses();

  const currentExpenses = periodFilter === 'week' ? weeklyExpenses : 
                          periodFilter === 'month' ? monthlyExpenses : 
                          yearlyExpenses;

  const maxExpense = Math.max(...currentExpenses, 0.01);
  const currentTotal = currentExpenses.reduce((sum, val) => sum + val, 0);
  const currentAverage = currentTotal > 0 ? currentTotal / currentExpenses.length : 0;

  const currentLabels = periodFilter === 'week' ? ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] :
                        periodFilter === 'month' ? ['Dia 1-5', 'Dia 6-10', 'Dia 11-15', 'Dia 16-20', 'Dia 21-25', 'Dia 26-30'] :
                        ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const periodTitle = periodFilter === 'week' ? 'Despesas Semanais' :
                      periodFilter === 'month' ? 'Despesas Mensais' :
                      'Despesas Anuais';

  const periodLabel = periodFilter === 'week' ? 'Esta semana' :
                      periodFilter === 'month' ? 'Este mês' :
                      'Este ano';

  const totals = calculateTotals();

  const handleQuickBillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (authenticated === false || authenticated === null || !user) {
    return null;
  }

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary pb-24">
      {/* Header */}
      <div className="bg-primary/20 backdrop-blur-sm border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">
                Visão Geral
              </h1>
              <p className="text-primary-foreground/80">
                Seus gastos desta semana
              </p>
            </div>
            <Button
              onClick={() => setShowQuickBillForm(!showQuickBillForm)}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nova Conta
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Bill Form */}
        {showQuickBillForm && (
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900">Adicionar Nova Conta</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleQuickBillSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quick-name">Nome *</Label>
                    <Input
                      id="quick-name"
                      value={quickBillData.name}
                      onChange={(e) => setQuickBillData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Conta de luz"
                      className="bg-white border-gray-300"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quick-amount">Valor (R$) *</Label>
                    <Input
                      id="quick-amount"
                      type="number"
                      step="0.01"
                      value={quickBillData.amount}
                      onChange={(e) => setQuickBillData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0,00"
                      className="bg-white border-gray-300"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quick-date">Data de Vencimento *</Label>
                    <Input
                      id="quick-date"
                      type="date"
                      value={quickBillData.dueDate}
                      onChange={(e) => setQuickBillData(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="bg-white border-gray-300"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quick-category">Categoria</Label>
                    <Select
                      value={quickBillData.categoryId || undefined}
                      onValueChange={(value) => setQuickBillData(prev => ({ ...prev, categoryId: value }))}
                    >
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quick-description">Descrição</Label>
                  <Textarea
                    id="quick-description"
                    value={quickBillData.description}
                    onChange={(e) => setQuickBillData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detalhes adicionais..."
                    className="bg-white border-gray-300"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowQuickBillForm(false);
                      setQuickBillData({ name: "", amount: "", dueDate: "", categoryId: "", description: "" });
                    }}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isQuickBillSubmitting}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isQuickBillSubmitting ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Expense Chart Card */}
        <Card className="bg-white shadow-lg">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">{periodTitle}</CardTitle>
            </div>

            {/* Tabs de filtro */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setPeriodFilter('week')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  periodFilter === 'week'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setPeriodFilter('month')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  periodFilter === 'month'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mês
              </button>
              <button
                onClick={() => setPeriodFilter('year')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  periodFilter === 'year'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Ano
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(currentTotal)}
                </p>
                <p className="text-sm text-gray-500">{periodLabel}</p>
              </div>

              {/* Bar Chart */}
              <div className="flex items-end justify-between gap-2 h-40 bg-gray-50 rounded-lg p-2">
                {currentExpenses.map((expense, index) => {
                  const heightPercent = maxExpense > 0 ? (expense / maxExpense) * 100 : 0;
                  const minHeight = expense > 0 ? Math.max(heightPercent, 5) : 0;

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex items-end justify-center relative" style={{ height: '128px' }}>
                        {expense > 0 ? (
                          <div
                            className="w-full bg-primary rounded-t transition-all hover:bg-primary/80 cursor-pointer"
                            style={{ 
                              height: `${minHeight}%`,
                              minHeight: '8px'
                            }}
                            title={`${currentLabels[index]}: ${formatCurrency(expense)}`}
                          />
                        ) : (
                          <div className="w-full h-2 bg-gray-300 rounded" />
                        )}
                      </div>
                      <span className="text-xs text-gray-600 font-medium">{currentLabels[index]}</span>
                    </div>
                  );
                })}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-500">Total de despesas</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(currentTotal)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    {periodFilter === 'week' ? 'Média diária' : 
                     periodFilter === 'month' ? 'Média por período' : 
                     'Média mensal'}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(currentAverage)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-600" />
                Total a Pagar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">
                {formatCurrency(totals.totalToPay)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                Total Pago
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(totals.totalPaid)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Bills */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900">Próximas Contas</CardTitle>
          </CardHeader>
          <CardContent>
            {billsLoading ? (
              <p className="text-gray-500 text-center py-4">Carregando...</p>
            ) : upcomingBills.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nenhuma conta próxima ao vencimento
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingBills.map((bill: any) => {
                  const daysUntil = getDaysUntilDue(bill.dueDate);
                  const isUrgent = daysUntil <= 3;
                  const category = categories.find((cat: any) => cat.id === bill.categoryId);

                  return (
                    <div
                      key={bill.id}
                      onClick={() => setLocation(`/bills/${bill.id}`)}
                      className={`
                        p-4 rounded-lg border-l-4 cursor-pointer
                        hover:bg-gray-50 transition-all
                        ${isUrgent ? 'border-l-red-500 bg-red-50/50' : 'border-l-gray-300'}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{bill.name}</h3>
                          <p className="text-sm text-gray-500">
                            {category?.name || 'Sem categoria'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(bill.amount / 100)}
                          </p>
                          <p className={`text-sm ${isUrgent ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            {daysUntil === 0 ? 'Vence hoje' : 
                             daysUntil === 1 ? 'Vence amanhã' :
                             `Vencimento em ${daysUntil} dias`}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Dashboard;