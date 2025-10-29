import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth, fetchWithAuth } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import type { Bill } from "@shared/schema";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Check,
  Calendar,
  Tag,
  Clock
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const BillDetails = () => {
  const [match, params] = useRoute<{ id: string }>("/bills/:id");
  const billId = params?.id;
  const [location, setLocation] = useLocation();
  const { user, authenticated } = useAuth();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMarkPaidDialog, setShowMarkPaidDialog] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (authenticated === false) {
      setLocation("/login");
    }
  }, [authenticated, setLocation]);

  // Redirect if no bill ID
  useEffect(() => {
    if (!billId) {
      setLocation("/bills");
    }
  }, [billId, setLocation]);

  // ✅ FETCH BILL - HOOKS NO TOPO!
  const { data: bill, isLoading, isError } = useQuery<Bill>({
    queryKey: [`/api/bills/${billId}`],
    queryFn: async () => {
      const response = await fetchWithAuth(`/api/bills/${billId}`);
      if (!response.ok) throw new Error('Failed to fetch bill');
      return response.json();
    },
    enabled: !!billId && !!user?.id,
  });

  // ✅ FETCH CATEGORIES - para mostrar o nome da categoria
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetchWithAuth('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
    enabled: authenticated === true && !!user?.id,
  });

  // ✅ MUTATIONS NO TOPO - ANTES DE QUALQUER RETURN!
  const markAsPaidMutation = useMutation({
    mutationFn: async () => {
      const response = await fetchWithAuth(`/api/bills/${billId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPaid: true }),
      });
      if (!response.ok) throw new Error('Failed to mark as paid');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bills/${billId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/bills'] });
      toast({
        title: "Conta marcada como paga!",
        description: "A conta foi atualizada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao marcar como paga",
        description: "Não foi possível atualizar a conta. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteBillMutation = useMutation({
    mutationFn: async () => {
      const response = await fetchWithAuth(`/api/bills/${billId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete bill');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bills'] });
      toast({
        title: "Conta excluída",
        description: "A conta foi removida com sucesso.",
        variant: "destructive",
      });
      setLocation("/bills");
    },
    onError: () => {
      toast({
        title: "Erro ao excluir conta",
        description: "Não foi possível excluir a conta. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // ✅ HANDLERS
  const handleMarkAsPaid = () => {
    setShowMarkPaidDialog(true);
  };

  const confirmMarkAsPaid = () => {
    markAsPaidMutation.mutate();
    setShowMarkPaidDialog(false);
  };

  const handleEdit = () => {
    setLocation(`/bills/${billId}/edit`);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteBillMutation.mutate();
    setShowDeleteDialog(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-success/10 text-success border-success/20";
      case "pending":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-muted";
    }
  };

  // ✅ AGORA SIM: EARLY RETURNS DEPOIS DOS HOOKS
  if (authenticated === false || !billId) {
    return null;
  }

  if (authenticated === null || !user || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary flex items-center justify-center">
        <div className="text-primary-foreground text-lg">Carregando detalhes...</div>
      </div>
    );
  }

  if (isError || !bill) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="text-primary-foreground text-lg mb-4">
            Conta não encontrada ou acesso negado
          </div>
          <button 
            onClick={() => setLocation("/bills")}
            className="text-primary-foreground underline"
          >
            Voltar para Contas
          </button>
        </div>
      </div>
    );
  }

  // ✅ BUSCAR NOME DA CATEGORIA
  const category = categories.find((cat: any) => cat.id === bill.categoryId);
  const categoryName = category?.name || 'Sem categoria';

  // ✅ JSX PRINCIPAL - BILL GARANTIDO QUE EXISTE
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary">
      <div className="bg-primary/80 backdrop-blur-sm border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLocation("/bills")}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">Detalhes da Conta</h1>
              <p className="text-primary-foreground/80">Informações detalhadas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl text-gray-900">
                {bill.name}
              </CardTitle>
              <Badge className={getStatusColor(bill.isPaid ? "paid" : "pending")}>
                {bill.isPaid ? "Pago" : "Pendente"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-6">
              <div className="text-4xl font-bold text-primary mb-2">
                R$ {(bill.amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-muted-foreground">Valor da conta</p>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Vencimento</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(bill.dueDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Tag className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Categoria</p>
                    <p className="font-semibold text-gray-900">
                      {categoryName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Criação</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(bill.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {bill.description && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Descrição</p>
                  <p className="text-gray-900">{bill.description}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={handleEdit}
            className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Editar Conta
          </Button>

          <Button 
            onClick={handleMarkAsPaid}
            variant="outline"
            className="border-green-500 text-green-600 hover:bg-green-50 flex items-center gap-2"
            disabled={bill.isPaid || markAsPaidMutation.isPending}
          >
            <Check className="w-4 h-4" />
            {markAsPaidMutation.isPending ? 'Marcando...' : bill.isPaid ? 'Já Pago' : 'Marcar como Pago'}
          </Button>

          <Button 
            onClick={handleDelete}
            variant="outline"
            className="border-red-500 text-red-600 hover:bg-red-50 flex items-center gap-2"
            disabled={deleteBillMutation.isPending}
          >
            <Trash2 className="w-4 h-4" />
            {deleteBillMutation.isPending ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </div>

      {/* Dialog - Marcar como Pago */}
      <AlertDialog open={showMarkPaidDialog} onOpenChange={setShowMarkPaidDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Marcar como paga?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja marcar esta conta como paga? Esta ação pode ser desfeita depois.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmMarkAsPaid} className="bg-green-600 hover:bg-green-700">
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog - Excluir Conta */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BillDetails;