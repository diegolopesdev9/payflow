import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { useToast } from "@/hooks/use-toast";
import type { Category } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft,
  Tag,
  Plus,
  Edit,
  Trash2,
  Home as HomeIcon,
  Car,
  ShoppingCart,
  Gamepad2,
  Heart,
  Book,
  Coffee,
  Shirt,
  CreditCard,
  TrendingUp,
  User
} from "lucide-react";

const Categories = () => {
  const [location, setLocation] = useLocation();
  const { user, authenticated } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("Tag");
  const [selectedColor, setSelectedColor] = useState("#3b82f6");

  // Redirect if not authenticated
  useEffect(() => {
    if (authenticated === false) {
      setLocation("/login");
    }
  }, [authenticated, setLocation]);

  if (authenticated === false) {
    return null;
  }

  const iconOptions = [
    { name: "HomeIcon", icon: HomeIcon, label: "Casa" },
    { name: "Car", icon: Car, label: "Transporte" },
    { name: "ShoppingCart", icon: ShoppingCart, label: "Compras" },
    { name: "Gamepad2", icon: Gamepad2, label: "Entretenimento" },
    { name: "Heart", icon: Heart, label: "Saúde" },
    { name: "Book", icon: Book, label: "Educação" },
    { name: "Coffee", icon: Coffee, label: "Alimentação" },
    { name: "Shirt", icon: Shirt, label: "Vestuário" }
  ];

  const colorOptions = [
    { value: "#3b82f6", label: "Azul", class: "bg-blue-500" },
    { value: "#ef4444", label: "Vermelho", class: "bg-red-500" },
    { value: "#22c55e", label: "Verde", class: "bg-green-500" },
    { value: "#f59e0b", label: "Amarelo", class: "bg-yellow-500" },
    { value: "#8b5cf6", label: "Roxo", class: "bg-purple-500" },
    { value: "#06b6d4", label: "Ciano", class: "bg-cyan-500" },
    { value: "#f97316", label: "Laranja", class: "bg-orange-500" },
    { value: "#ec4899", label: "Rosa", class: "bg-pink-500" }
  ];

  // Fetch categories using React Query
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    enabled: !!user?.id,
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: { name: string; icon: string; color: string }) => {
      const res = await fetchWithAuth('/api/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Categoria criada",
        description: "A categoria foi criada com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao criar categoria",
        description: "Não foi possível criar a categoria. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...categoryData }: { id: string; name: string; icon: string; color: string }) => {
      const res = await fetchWithAuth(`/api/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(categoryData),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Categoria atualizada",
        description: "A categoria foi atualizada com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar categoria",
        description: "Não foi possível atualizar a categoria. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao excluir categoria",
        description: "Não foi possível excluir a categoria. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSaveCategory = () => {
    if (!categoryName.trim()) return;
    if (!user?.id) return;

    if (editingCategory) {
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        name: categoryName,
        icon: selectedIcon,
        color: selectedColor
      });
    } else {
      createCategoryMutation.mutate({
        name: categoryName,
        icon: selectedIcon,
        color: selectedColor
      });
    }

    setCategoryName("");
    setSelectedIcon("Tag");
    setSelectedColor("#3b82f6");
    setEditingCategory(null);
    setIsDialogOpen(false);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setSelectedIcon(category.icon || "Tag");
    setSelectedColor(category.color || "#3b82f6");
    setIsDialogOpen(true);
  };

  const handleDeleteCategory = (categoryId) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  const getIconComponent = (iconName) => {
    const iconOption = iconOptions.find(opt => opt.name === iconName);
    return iconOption ? iconOption.icon : Tag;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary flex items-center justify-center">
        <div className="text-primary-foreground text-lg" data-testid="loading-categories">Carregando categorias...</div>
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
              size="icon"
              onClick={() => setLocation("/profile")}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-primary-foreground">Categorias de Gastos</h1>
              <p className="text-primary-foreground/80">Organize suas despesas por categoria</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryName("");
                    setSelectedIcon("Tag");
                    setSelectedColor("#3b82f6");
                  }}
                  className="btn-secondary-financial"
                  data-testid="button-new-category"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? "Editar Categoria" : "Nova Categoria"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category-name">Nome da Categoria</Label>
                    <Input
                      id="category-name"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      placeholder="Ex: Supermercado, Combustível..."
                      data-testid="input-category-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Ícone</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {iconOptions.map((option) => {
                        const IconComponent = option.icon;
                        return (
                          <button
                            key={option.name}
                            onClick={() => setSelectedIcon(option.name)}
                            className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-colors ${
                              selectedIcon === option.name
                                ? "border-primary bg-primary/10"
                                : "border-border hover:bg-muted"
                            }`}
                            data-testid={`button-icon-${option.name.toLowerCase()}`}
                          >
                            <IconComponent className="w-5 h-5" />
                            <span className="text-xs">{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Cor</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {colorOptions.map((color) => {
                        return (
                          <button
                            key={color.value}
                            onClick={() => setSelectedColor(color.value)}
                            className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-colors ${
                              selectedColor === color.value
                                ? "border-primary bg-primary/10"
                                : "border-border hover:bg-muted"
                            }`}
                            data-testid={`button-color-${color.label.toLowerCase()}`}
                          >
                            <div className={`w-6 h-6 rounded-full ${color.class}`} />
                            <span className="text-xs">{color.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Button 
                    onClick={handleSaveCategory} 
                    className="btn-primary-financial w-full"
                    disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                    data-testid="button-save-category"
                  >
                    {createCategoryMutation.isPending || updateCategoryMutation.isPending ? "Salvando..." : 
                     editingCategory ? "Salvar Alterações" : "Criar Categoria"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Categories List */}
        <div className="space-y-3">
          {categories.map((category) => {
            const IconComponent = getIconComponent(category.icon);
            return (
              <Card key={category.id} className="fin-card" data-testid={`card-category-${category.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" 
                         style={{ backgroundColor: `${category.color}20` }}>
                      <IconComponent className="w-6 h-6" style={{ color: category.color }} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold" data-testid={`text-category-name-${category.id}`}>
                          {category.name}
                        </h3>
                        <Badge variant="secondary" className="text-xs" data-testid={`badge-category-${category.id}`}>
                          Ativa
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground" data-testid={`text-category-id-${category.id}`}>
                        ID: {String(category.id).slice(0, 8)}...
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                        disabled={updateCategoryMutation.isPending}
                        data-testid={`button-edit-category-${category.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={deleteCategoryMutation.isPending}
                        className="text-destructive border-destructive hover:bg-destructive/10"
                        data-testid={`button-delete-category-${category.id}`}
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
          <Card className="fin-card" data-testid="card-no-categories">
            <CardContent className="p-12 text-center">
              <Tag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2" data-testid="text-no-categories-title">
                Nenhuma categoria criada
              </h3>
              <p className="text-muted-foreground mb-4" data-testid="text-no-categories-desc">
                Crie categorias para organizar melhor suas despesas
              </p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="btn-primary-financial"
                data-testid="button-create-first-category"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar primeira categoria
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-4 gap-1">
              <button 
                onClick={() => setLocation("/dashboard")}
                className="nav-item"
              >
                <HomeIcon className="w-5 h-5" />
                <span className="text-sm">Home</span>
              </button>
              <button 
                onClick={() => setLocation("/bills")}
                className="nav-item"
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-sm">Contas</span>
              </button>
              <button 
                onClick={() => setLocation("/reports")}
                className="nav-item"
              >
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm">Relatórios</span>
              </button>
              <button 
                onClick={() => setLocation("/profile")}
                className="nav-item active"
              >
                <User className="w-5 h-5" />
                <span className="text-sm">Perfil</span>
              </button>
            </div>
          </div>
        </div>

        {/* Add bottom padding to prevent content being hidden by navigation */}
        <div className="h-20" />
      </div>
    </div>
  );
};

export default Categories;