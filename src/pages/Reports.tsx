import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth, fetchWithAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";

const Reports = () => {
  const [location, setLocation] = useLocation();
  const [activeFilter, setActiveFilter] = useState("mensal");
  const { user, authenticated } = useAuth();

  // Fetch bills
  const { data: bills = [], isLoading } = useQuery({
    queryKey: ['/api/bills'],
    queryFn: async () => {
      const response = await fetchWithAuth('/api/bills');
      if (!response.ok) throw new Error('Failed to fetch bills');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: authenticated === true && !!user?.id,
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

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalPaid = 0;
    let totalPending = 0;
    let monthlyPaid = 0;
    let monthlyPending = 0;
    const categoriesData: { [key: string]: number } = {};

    bills.forEach((bill: any) => {
      const billDate = new Date(bill.dueDate);
      const billMonth = billDate.getMonth();
      const billYear = billDate.getFullYear();
      const amount = bill.amount / 100;

      // Total geral
      if (bill.isPaid) {
        totalPaid += amount;
      } else {
        totalPending += amount;
      }

      // Mensal (mês atual)
      if (activeFilter === "mensal" && billMonth === currentMonth && billYear === currentYear) {
        if (bill.isPaid) {
          monthlyPaid += amount;
        } else {
          monthlyPending += amount;
        }
      }

      // Anual (ano atual)
      if (activeFilter === "anual" && billYear === currentYear) {
        if (bill.isPaid) {
          monthlyPaid += amount;
        } else {
          monthlyPending += amount;
        }
      }

      // Gastos por categoria (todas as contas com categoria)
      if (bill.categoryId) {
        if (activeFilter === "mensal" && billMonth === currentMonth && billYear === currentYear) {
          categoriesData[bill.categoryId] = (categoriesData[bill.categoryId] || 0) + amount;
        } else if (activeFilter === "anual" && billYear === currentYear) {
          categoriesData[bill.categoryId] = (categoriesData[bill.categoryId] || 0) + amount;
        }
      }
    });

    // Converter categorias para array e ordenar
    const categoryMap = new Map(categories.map((cat: any) => [cat.id, cat]));
    const sortedCategories = Object.entries(categoriesData)
      .map(([id, value]) => ({
        id,
        name: categoryMap.get(id)?.name || 'Sem categoria',
        color: categoryMap.get(id)?.color || '#3b82f6',
        value,
        percentage: monthlyPaid > 0 ? (value / monthlyPaid) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);

    return {
      paid: activeFilter === "mensal" ? monthlyPaid : monthlyPaid,
      pending: activeFilter === "mensal" ? monthlyPending : monthlyPending,
      categories: sortedCategories,
    };
  }, [bills, categories, activeFilter]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  if (authenticated === false || authenticated === null || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary pb-24">
      {/* Header */}
      <div className="bg-primary/20 backdrop-blur-sm border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/dashboard")}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">Relatórios</h1>
              <p className="text-primary-foreground/80">Análise detalhada dos seus gastos</p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveFilter("mensal")}
              className={`
                py-3 px-4 rounded-lg text-sm font-medium transition-all
                ${activeFilter === "mensal"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "bg-white/10 text-white hover:bg-white/20"
                }
              `}
            >
              Mensal
            </button>
            <button
              onClick={() => setActiveFilter("anual")}
              className={`
                py-3 px-4 rounded-lg text-sm font-medium transition-all
                ${activeFilter === "anual"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "bg-white/10 text-white hover:bg-white/20"
                }
              `}
            >
              Anual
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {isLoading ? (
          <div className="text-center text-white py-8">Carregando relatórios...</div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-white shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    Total Pago
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(stats.paid)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {activeFilter === "mensal" ? "Este mês" : "Este ano"}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    Total Pendente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-red-600">
                    {formatCurrency(stats.pending)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">A vencer</p>
                </CardContent>
              </Card>
            </div>

            {/* Total Summary */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Resumo {activeFilter === "mensal" ? "Mensal" : "Anual"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Total de Gastos</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.paid + stats.pending)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Pago</p>
                      <p className="text-xl font-semibold text-green-600">
                        {formatCurrency(stats.paid)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {stats.paid + stats.pending > 0
                          ? `${((stats.paid / (stats.paid + stats.pending)) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Pendente</p>
                      <p className="text-xl font-semibold text-red-600">
                        {formatCurrency(stats.pending)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {stats.paid + stats.pending > 0
                          ? `${((stats.pending / (stats.paid + stats.pending)) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Categories Breakdown */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900">Gastos por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.categories.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg font-medium mb-2">
                      Nenhum gasto registrado
                    </p>
                    <p className="text-gray-500 text-sm">
                      Marque suas contas como pagas para ver os gastos por categoria
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.categories.map((category) => (
                      <div key={category.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="text-gray-900 font-medium">{category.name}</span>
                          </div>
                          <span className="text-gray-900 font-semibold">
                            {formatCurrency(category.value)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${category.percentage}%`,
                              backgroundColor: category.color
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          {category.percentage.toFixed(1)}% do total
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Reports;