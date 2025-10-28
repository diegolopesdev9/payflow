import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth, fetchWithAuth } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { BottomNavigation } from "@/components/BottomNavigation";
import {
  Search,
  Plus,
  CheckCircle2,
  Circle,
  ArrowLeft,
  DollarSign
} from "lucide-react";

const Bills = () => {
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("todas");
  const { user, authenticated } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (authenticated === false) {
      setLocation("/login");
    }
  }, [authenticated, setLocation]);

  // Fetch bills usando React Query
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

  // Toggle paid mutation
  const togglePaidMutation = useMutation({
    mutationFn: async ({ id, isPaid }: { id: string; isPaid: boolean }) => {
      const response = await fetchWithAuth(`/api/bills/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPaid }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update bill');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.refetchQueries({ queryKey: ['/api/bills'] });
      queryClient.refetchQueries({ queryKey: ['/api/bills/upcoming'] });
      toast({
        title: "Status atualizado!",
        description: `Conta marcada como ${data.isPaid ? 'paga' : 'pendente'}.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Não foi possível atualizar o status da conta.",
        variant: "destructive",
      });
    },
  });

  if (authenticated === false || authenticated === null || !user) {
    return null;
  }

  // Create category map
  const categoryMap = new Map(categories.map((cat: any) => [cat.id, cat]));

  // Transform bills com todos os campos necessários
  const transformedBills = bills.map((bill: any) => {
    const category = categoryMap.get(bill.categoryId);
    const dueDate = bill.dueDate ? new Date(bill.dueDate) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zerar horas para comparação apenas de data

    const dueDateOnly = dueDate ? new Date(dueDate) : null;
    if (dueDateOnly) {
      dueDateOnly.setHours(0, 0, 0, 0);
    }

    const daysLeft = dueDateOnly ? Math.ceil((dueDateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const isOverdue = dueDateOnly && dueDateOnly < today && !bill.isPaid;

    let priority = "low";
    if (isOverdue) priority = "overdue";
    else if (daysLeft <= 3 && !bill.isPaid) priority = "high";
    else if (daysLeft <= 7 && !bill.isPaid) priority = "medium";

    return {
      ...bill,
      categoryName: category?.name ?? 'Sem categoria',
      categoryColor: category?.color ?? '#3b82f6',
      formattedDueDate: dueDate ? dueDate.toLocaleDateString('pt-BR') : 'Data inválida',
      formattedAmount: `R$ ${(bill.amount / 100).toFixed(2).replace('.', ',')}`,
      daysLeft,
      priority,
      isOverdue,
    };
  });

  // Filter bills
  const filterBills = (status: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (status) {
      case "vencer":
        return transformedBills.filter((bill: any) => {
          const dueDate = new Date(bill.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return !bill.isPaid && dueDate >= today;
        });
      case "vencidas":
        return transformedBills.filter((bill: any) => {
          const dueDate = new Date(bill.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return !bill.isPaid && dueDate < today;
        });
      case "pagas":
        return transformedBills.filter((bill: any) => bill.isPaid);
      default:
        return transformedBills;
    }
  };

  const filteredBills = filterBills(activeFilter).filter((bill: any) =>
    bill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort bills
  const sortedBills = [...filteredBills].sort((a: any, b: any) => {
    if (a.isPaid !== b.isPaid) return a.isPaid ? 1 : -1;
    if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
    return a.daysLeft - b.daysLeft;
  });

  const handleTogglePaid = (billId: string, currentStatus: boolean) => {
    togglePaidMutation.mutate({ id: billId, isPaid: !currentStatus });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary pb-24">
      {/* Header */}
      <div className="bg-primary/20 backdrop-blur-sm border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/dashboard")}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-primary-foreground">
              Minhas Contas
            </h1>
            <Button
              size="icon"
              onClick={() => setLocation("/bills/new")}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-foreground/60 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar contas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
            />
          </div>

          {/* Filters - Estilo dos Relatórios */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => setActiveFilter("todas")}
              className={`
                py-3 px-4 rounded-lg text-sm font-medium transition-all
                ${activeFilter === "todas" 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "bg-white/10 text-white hover:bg-white/20"
                }
              `}
            >
              Todas
            </button>
            <button
              onClick={() => setActiveFilter("vencer")}
              className={`
                py-3 px-4 rounded-lg text-sm font-medium transition-all
                ${activeFilter === "vencer" 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "bg-white/10 text-white hover:bg-white/20"
                }
              `}
            >
              A Vencer
            </button>
            <button
              onClick={() => setActiveFilter("vencidas")}
              className={`
                py-3 px-4 rounded-lg text-sm font-medium transition-all
                ${activeFilter === "vencidas" 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "bg-white/10 text-white hover:bg-white/20"
                }
              `}
            >
              Vencidas
            </button>
            <button
              onClick={() => setActiveFilter("pagas")}
              className={`
                py-3 px-4 rounded-lg text-sm font-medium transition-all
                ${activeFilter === "pagas" 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "bg-white/10 text-white hover:bg-white/20"
                }
              `}
            >
              Pagas
            </button>
          </div>
        </div>
      </div>

      {/* Bills List */}
      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center text-gray-700 py-8">
            Carregando contas...
          </div>
        ) : sortedBills.length === 0 ? (
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-600 text-center mb-4">
                Nenhuma conta encontrada
              </p>
              <Button
                onClick={() => setLocation("/bills/new")}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Conta
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedBills.map((bill: any) => (
              <Card
                key={bill.id}
                onClick={() => setLocation(`/bills/${bill.id}`)}
                className={`
                  cursor-pointer
                  bg-white border-gray-200
                  hover:bg-gray-50 transition-all
                  shadow-sm
                  ${bill.isPaid ? 'border-l-4 border-l-green-500' : ''}
                  ${bill.isOverdue ? 'border-l-4 border-l-red-500' : ''}
                  ${bill.priority === 'medium' && !bill.isPaid && !bill.isOverdue ? 'border-l-4 border-l-yellow-500' : ''}
                `}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    {/* Checkbox */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleTogglePaid(bill.id, bill.isPaid)}
                        disabled={togglePaidMutation.isPending}
                        className="shrink-0 hover:scale-110 transition-transform"
                      >
                        {bill.isPaid ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate mb-0.5">
                          {bill.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span className={bill.isOverdue ? 'text-red-600 font-medium' : ''}>
                            {bill.formattedDueDate}
                          </span>
                          <span>•</span>
                          <span className="truncate">{bill.categoryName}</span>
                        </div>
                      </div>

                      {/* Valor */}
                      <span className={`font-semibold text-base ml-3 shrink-0 ${bill.isPaid ? 'line-through text-gray-500' : bill.isOverdue ? 'text-red-600' : 'text-green-600'}`}>
                        {bill.formattedAmount}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Bills;