import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth, fetchWithAuth } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Bill } from "@shared/schema";
import { ArrowLeft, Save } from "lucide-react";

const EditBill = () => {
  const [match, params] = useRoute<{ id: string }>("/bills/:id/edit");
  const billId = params?.id;
  const [location, setLocation] = useLocation();
  const { user, authenticated } = useAuth();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    dueDate: "",
    categoryId: "none",
    description: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (authenticated === false) {
      setLocation("/login");
    }
  }, [authenticated, setLocation]);

  // Fetch bill details
  const { data: bill, isLoading: loadingBill } = useQuery<Bill>({
    queryKey: [`/api/bills/${billId}`],
    queryFn: async () => {
      const response = await fetchWithAuth(`/api/bills/${billId}`);
      if (!response.ok) throw new Error('Failed to fetch bill');
      return response.json();
    },
    enabled: !!billId && !!user?.id,
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

  // Populate form when bill loads
  useEffect(() => {
    if (bill) {
      setFormData({
        name: bill.name || "",
        amount: String((bill.amount / 100).toFixed(2)),
        dueDate: bill.dueDate ? new Date(bill.dueDate).toISOString().split('T')[0] : "",
        categoryId: bill.categoryId || "none",
        description: bill.description || "",
      });
    }
  }, [bill]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetchWithAuth(`/api/bills/${billId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          amount: Math.round(parseFloat(data.amount) * 100),
          dueDate: data.dueDate,
          categoryId: data.categoryId === "none" ? null : data.categoryId,
          description: data.description || null,
        }),
      });
      if (!response.ok) throw new Error('Failed to update bill');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bills/${billId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/bills'] });
      toast({
        title: "Conta atualizada!",
        description: "As alterações foram salvas com sucesso.",
      });
      setLocation(`/bills/${billId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Não foi possível atualizar a conta.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!formData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe o nome da conta.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, informe um valor maior que zero.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.dueDate) {
      toast({
        title: "Data obrigatória",
        description: "Por favor, informe a data de vencimento.",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (authenticated === false || !billId) {
    return null;
  }

  if (authenticated === null || !user || loadingBill) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary flex items-center justify-center">
        <div className="text-primary-foreground text-lg">Carregando...</div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="text-primary-foreground text-lg mb-4">
            Conta não encontrada
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary pb-24">
      {/* Header */}
      <div className="bg-primary/80 backdrop-blur-sm border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLocation(`/bills/${billId}`)}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">Editar Conta</h1>
              <p className="text-primary-foreground/80">Atualize as informações da conta</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-6">
        <Card className="bg-white shadow-lg max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-gray-900">Informações da Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-900">
                  Nome da Conta *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Ex: Aluguel, Luz, Água..."
                  className="bg-white border-gray-300 text-gray-900"
                  required
                />
              </div>

              {/* Valor */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-gray-900">
                  Valor (R$) *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  placeholder="0,00"
                  className="bg-white border-gray-300 text-gray-900"
                  required
                />
              </div>

              {/* Data de Vencimento */}
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-gray-900">
                  Data de Vencimento *
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange("dueDate", e.target.value)}
                  className="bg-white border-gray-300 text-gray-900"
                  required
                />
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-900">
                  Categoria
                </Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => handleChange("categoryId", value)}
                >
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem categoria</SelectItem>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-900">
                  Descrição (opcional)
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Adicione detalhes sobre esta conta..."
                  className="bg-white border-gray-300 text-gray-900 min-h-24"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation(`/bills/${billId}`)}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditBill;