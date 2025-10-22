import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth, fetchWithAuth } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { BottomNavigation } from "@/components/BottomNavigation";
import {
  Search,
  Plus,
  Calendar,
  CheckCircle2,
  Circle,
  ArrowLeft,
  Tag,
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
      console.log('🔄 Enviando PUT:', { id, isPaid });
      const response = await fetchWithAuth(`/api/bills/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPaid }),
      });
      console.log('📡 Response status:', response.status);
      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Erro do servidor:', error);
        throw new Error(error.error || 'Failed to update bill');
      }
      const data = await response.json();
      console.log('✅ Resposta:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('✅ Mutation success, refetchando...');
      queryClient.refetchQueries({ queryKey: ['/api/bills'] });
      queryClient.refetchQueries({ queryKey: ['/api/bills/upcoming'] });
      toast({
        title: "Status atualizado!",
        description: `Conta marcada como ${data.isPaid ? 'paga' : 'pendente'}.`,
      });
    },
    onError: (error: any) => {
      console.error('❌ Mutation error:', error);
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
    const daysLeft = dueDate ? Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    let priority = "low";
    if (daysLeft <= 3 && !bill.isPaid) priority = "high";
    else if (daysLeft <= 7 && !bill.isPaid) priority = "medium";

    return {
      ...bill,
      categoryName: category?.name ?? 'Sem categoria',
      categoryColor: category?.color ?? '#3b82f6',
      formattedDueDate: dueDate ? dueDate.toLocaleDateString('pt-BR') : 'Data inválida',
      formattedAmount: `R$ ${(bill.amount / 100).toFixed(2).replace('.', ',')}`,
      daysLeft,
      priority,
    };
  });

  // Filter bills
  const filterBills = (status: string) => {
    switch (status) {
      case "vencer":
        return transformedBills.filter((bill: any) => !bill.isPaid);
      case "pagos":
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

          {/* Filters */}
          <Tabs value={activeFilter} onValueChange={setActiveFilter}>
            <TabsList className="grid w-full grid-cols-3 bg-primary-foreground/10">
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="vencer">A Vencer</TabsTrigger>
              <TabsTrigger value="pagos">Pagas</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Bills List */}
      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center text-primary-foreground py-8">
            Carregando contas...
          </div>
        ) : sortedBills.length === 0 ? (
          <Card className="bg-primary-foreground/10 border-primary-foreground/20">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="w-16 h-16 text-primary-foreground/40 mb-4" />
              <p className="text-primary-foreground/60 text-center mb-4">
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
                className={`
                  bg-primary-foreground/10 border-primary-foreground/20
                  hover:bg-primary-foreground/15 transition-all
                  ${bill.isPaid ? 'border-l-4 border-l-green-500' : ''}
                  ${bill.priority === 'high' && !bill.isPaid ? 'border-l-4 border-l-red-500' : ''}
                  ${bill.priority === 'medium' && !bill.isPaid ? 'border-l-4 border-l-yellow-500' : ''}
                `}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleTogglePaid(bill.id, bill.isPaid)}
                      disabled={togglePaidMutation.isPending}
                      className="mt-1 shrink-0 hover:scale-110 transition-transform"
                    >
                      {bill.isPaid ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-primary-foreground/40 hover:text-primary-foreground/60" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-primary-foreground">
                          {bill.name}
                        </h3>
                        <span className={`font-bold text-lg whitespace-nowrap ${bill.isPaid ? 'line-through text-primary-foreground/80' : 'text-accent'}`}>
                          {bill.formattedAmount}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-sm text-primary-foreground/70">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{bill.formattedDueDate}</span>
                        </div>

                        {!bill.isPaid && (
                          <Badge
                            variant={
                              bill.priority === 'high' ? 'destructive' :
                              bill.priority === 'medium' ? 'default' : 'secondary'
                            }
                            className="text-xs"
                          >
                            {bill.daysLeft === 0 ? 'Vence hoje' :
                             bill.daysLeft === 1 ? 'Vence amanhã' :
                             bill.daysLeft < 0 ? `Vencida há ${Math.abs(bill.daysLeft)} dias` :
                             `${bill.daysLeft} dias`}
                          </Badge>
                        )}

                        {bill.isPaid && (
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                            ✓ Paga
                          </Badge>
                        )}

                        <div className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          <span>{bill.categoryName}</span>
                        </div>
                      </div>
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