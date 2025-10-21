import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { BottomNavigation } from "@/components/BottomNavigation";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth } from "@/lib/auth";
import {
  Plus,
  Pencil,
  Trash2,
  Home,
  Zap,
  Utensils,
  Car,
  CreditCard,
  HeartPulse,
  GraduationCap,
  Gamepad2,
  Shirt,
  Smartphone,
  Wallet,
  ShoppingBag,
  Film,
  Coffee,
  Dumbbell,
  Plane,
} from "lucide-react";
import type { Category } from "../../shared/schema";

// Mapa de ícones disponíveis
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  zap: Zap,
  utensils: Utensils,
  car: Car,
  "credit-card": CreditCard,
  "heart-pulse": HeartPulse,
  "graduation-cap": GraduationCap,
  "gamepad-2": Gamepad2,
  shirt: Shirt,
  smartphone: Smartphone,
  wallet: Wallet,
  "shopping-bag": ShoppingBag,
  film: Film,
  coffee: Coffee,
  dumbbell: Dumbbell,
  plane: Plane,
};

// Traduções dos ícones para o português
const ICON_TRANSLATIONS: Record<string, string> = {
  home: "Início",
  zap: "Energia",
  utensils: "Alimentação",
  car: "Transporte",
  "credit-card": "Cartão de Crédito",
  "heart-pulse": "Saúde",
  "graduation-cap": "Educação",
  "gamepad-2": "Jogos",
  shirt: "Roupas",
  smartphone: "Celular",
  wallet: "Carteira",
  "shopping-bag": "Compras",
  film: "Filmes",
  coffee: "Café",
  dumbbell: "Academia",
  plane: "Viagem",
};


// Cores disponíveis
const COLORS = [
  { name: "Verde", value: "#10b981" },
  { name: "Amarelo", value: "#f59e0b" },
  { name: "Vermelho", value: "#ef4444" },
  { name: "Azul", value: "#3b82f6" },
  { name: "Roxo", value: "#8b5cf6" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Ciano", value: "#06b6d4" },
  { name: "Laranja", value: "#f97316" },
  { name: "Roxo Claro", value: "#a855f7" },
  { name: "Turquesa", value: "#14b8a6" },
];

const Categories = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    color: "#10b981",
    icon: "home",
  });

  // Buscar categorias
  const { data: categories = [], isLoading, error } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      console.log("🔍 [Categories] Iniciando fetch de categorias...");
      const response = await fetchWithAuth("/api/categories");
      console.log("🔍 [Categories] Response status:", response.status);
      if (!response.ok) {
        console.error("❌ [Categories] Erro na resposta:", response.status);
        throw new Error("Erro ao carregar categorias");
      }
      const data = await response.json();
      console.log("✅ [Categories] Categorias recebidas:", data);
      console.log("✅ [Categories] Quantidade:", data?.length || 0);
      return data;
    },
  });

  console.log("📊 [Categories] Estado atual:", { 
    isLoading, 
    hasError: !!error, 
    categoriesCount: categories?.length || 0,
    categories 
  });

  // Criar categoria
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; color: string; icon: string }) => {
      const response = await fetchWithAuth("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erro ao criar categoria");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsCreateOpen(false);
      resetForm();
      toast({
        title: "Categoria criada!",
        description: "A categoria foi criada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar a categoria.",
        variant: "destructive",
      });
    },
  });

  // Editar categoria
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { name: string; color: string; icon: string };
    }) => {
      const response = await fetchWithAuth(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erro ao atualizar categoria");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsEditOpen(false);
      setSelectedCategory(null);
      resetForm();
      toast({
        title: "Categoria atualizada!",
        description: "A categoria foi atualizada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a categoria.",
        variant: "destructive",
      });
    },
  });

  // Deletar categoria
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetchWithAuth(`/api/categories/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Erro ao deletar categoria");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsDeleteOpen(false);
      setSelectedCategory(null);
      toast({
        title: "Categoria removida!",
        description: "A categoria foi removida com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover a categoria.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", color: "#10b981", icon: "home" });
  };

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira um nome para a categoria.",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEdit = () => {
    if (!selectedCategory) return;
    if (!formData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira um nome para a categoria.",
        variant: "destructive",
      });
      return;
    }
    updateMutation.mutate({ id: selectedCategory.id, data: formData });
  };

  const handleDelete = () => {
    if (!selectedCategory) return;
    deleteMutation.mutate(selectedCategory.id);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      color: category.color || "#10b981",
      icon: category.icon || "home",
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteOpen(true);
  };

  const getIconComponent = (iconName: string) => {
    return ICON_MAP[iconName] || Home;
  };

  if (isLoading) {
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
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/dashboard")}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-primary-foreground">Categorias</h1>
                <p className="text-primary-foreground/80">Organize suas despesas</p>
              </div>
              <Button onClick={openCreateDialog} className="btn-financial">
                <Plus className="w-4 h-4 mr-2" />
                Nova Categoria
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Grid de Categorias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
          {categories.map((category) => {
            const IconComponent = getIconComponent(category.icon || "home");
            return (
              <Card
                key={category.id}
                className="fin-card cursor-pointer hover:shadow-lg transition-all duration-300 group"
                style={{
                  borderLeft: `4px solid ${category.color || "#10b981"}`,
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: `${category.color || "#10b981"}20`,
                        }}
                      >
                        <IconComponent
                          className="w-6 h-6"
                          style={{ color: category.color || "#10b981" }}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{category.name}</h3>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog(category);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteDialog(category);
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {categories.length === 0 && (
          <Card className="fin-card text-center">
            <CardContent className="p-12">
              <div className="text-muted-foreground mb-4">
                <Wallet className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma categoria cadastrada</h3>
                <p>Comece criando sua primeira categoria</p>
              </div>
              <Button onClick={openCreateDialog} className="btn-financial">
                <Plus className="w-4 h-4 mr-2" />
                Criar Categoria
              </Button>
            </CardContent>
          </Card>
        )}

        <BottomNavigation />
      </div>

      {/* Dialog Criar */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>Crie uma nova categoria para organizar suas despesas</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Ex: Alimentação, Transporte..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Ícone</Label>
              <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(ICON_MAP).map((iconKey) => {
                    const IconComponent = ICON_MAP[iconKey];
                    return (
                      <SelectItem key={iconKey} value={iconKey}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4" />
                          <span>{ICON_TRANSLATIONS[iconKey] || iconKey}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="grid grid-cols-5 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`w-full h-10 rounded-md border-2 transition-all ${
                      formData.color === color.value ? "border-foreground scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
            <DialogDescription>Atualize as informações da categoria</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome *</Label>
              <Input
                id="edit-name"
                placeholder="Ex: Alimentação, Transporte..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-icon">Ícone</Label>
              <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(ICON_MAP).map((iconKey) => {
                    const IconComponent = ICON_MAP[iconKey];
                    return (
                      <SelectItem key={iconKey} value={iconKey}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4" />
                          <span>{ICON_TRANSLATIONS[iconKey] || iconKey}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="grid grid-cols-5 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`w-full h-10 rounded-md border-2 transition-all ${
                      formData.color === color.value ? "border-foreground scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Deletar */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria "{selectedCategory?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Categories;