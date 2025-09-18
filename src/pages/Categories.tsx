import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("Tag");

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

  const [categories, setCategories] = useState([
    {
      id: 1,
      name: "Moradia",
      icon: "HomeIcon",
      color: "bg-primary",
      count: 12,
      total: 2500.00
    },
    {
      id: 2,
      name: "Alimentação",
      icon: "Coffee",
      color: "bg-secondary",
      count: 24,
      total: 800.00
    },
    {
      id: 3,
      name: "Transporte",
      icon: "Car",
      color: "bg-accent",
      count: 8,
      total: 450.00
    },
    {
      id: 4,
      name: "Entretenimento",
      icon: "Gamepad2",
      color: "bg-warning",
      count: 15,
      total: 320.00
    },
    {
      id: 5,
      name: "Saúde",
      icon: "Heart",
      color: "bg-success",
      count: 6,
      total: 280.00
    }
  ]);

  const handleSaveCategory = () => {
    if (!categoryName.trim()) return;

    if (editingCategory) {
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, name: categoryName, icon: selectedIcon }
          : cat
      ));
    } else {
      const newCategory = {
        id: Date.now(),
        name: categoryName,
        icon: selectedIcon,
        color: "bg-muted",
        count: 0,
        total: 0
      };
      setCategories([...categories, newCategory]);
    }

    setCategoryName("");
    setSelectedIcon("Tag");
    setEditingCategory(null);
    setIsDialogOpen(false);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setSelectedIcon(category.icon);
    setIsDialogOpen(true);
  };

  const handleDeleteCategory = (categoryId) => {
    setCategories(categories.filter(cat => cat.id !== categoryId));
  };

  const getIconComponent = (iconName) => {
    const iconOption = iconOptions.find(opt => opt.name === iconName);
    return iconOption ? iconOption.icon : Tag;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary">
      {/* Header */}
      <div className="bg-primary/80 backdrop-blur-sm border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/profile")}
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
                  }}
                  className="btn-secondary-financial"
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
                          >
                            <IconComponent className="w-5 h-5" />
                            <span className="text-xs">{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <Button onClick={handleSaveCategory} className="btn-primary-financial w-full">
                    {editingCategory ? "Salvar Alterações" : "Criar Categoria"}
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
              <Card key={category.id} className="fin-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${category.color}/10 rounded-lg flex items-center justify-center`}>
                      <IconComponent className={`w-6 h-6 text-primary`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{category.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {category.count} contas
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Total: R$ {category.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-destructive border-destructive hover:bg-destructive/10"
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
          <Card className="fin-card">
            <CardContent className="p-12 text-center">
              <Tag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma categoria criada</h3>
              <p className="text-muted-foreground mb-4">
                Crie categorias para organizar melhor suas despesas
              </p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="btn-primary-financial"
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
                onClick={() => navigate("/dashboard")}
                className="nav-item"
              >
                <HomeIcon className="w-5 h-5" />
                <span className="text-sm">Home</span>
              </button>
              <button 
                onClick={() => navigate("/bills")}
                className="nav-item"
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-sm">Contas</span>
              </button>
              <button 
                onClick={() => navigate("/reports")}
                className="nav-item"
              >
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm">Relatórios</span>
              </button>
              <button 
                onClick={() => navigate("/profile")}
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