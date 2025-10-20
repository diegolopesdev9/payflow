import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  CalendarIcon, 
  ArrowLeft, 
  Save, 
  X, 
  Plus,
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useBills } from "@/hooks/useBills";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import type { Category } from "../../shared/schema";

// Mapa de ícones
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

const getIconComponent = (iconName: string) => {
  return ICON_MAP[iconName] || Wallet;
};

const NewBill = () => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, authenticated } = useAuth();
  const { createBill } = useBills();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    categoryId: "",
    description: ""
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (authenticated === false) {
      setLocation("/login");
    }
  }, [authenticated, setLocation]);

  // Fetch user categories
  const { data: categories = [], isLoading: categoriesLoading, isError: categoriesError } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    enabled: !!user?.id,
  });

  // Show loading while auth is resolving
  if (authenticated === null || (authenticated && !user)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary flex items-center justify-center">
        <div className="text-primary-foreground text-lg" data-testid="loading-new-bill">Carregando...</div>
      </div>
    );
  }

  // Redirect if not authenticated (handled by useEffect)
  if (authenticated === false) {
    return null;
  }

  // Categories are now fetched from API via React Query

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate) {
      toast({
        title: "Data obrigatória",
        description: "Por favor, selecione uma data de vencimento.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não encontrado. Faça login novamente.",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      await createBill({
        name: formData.name,
        amount: Math.round(parseFloat(formData.amount) * 100), // Convert to cents
        dueDate: selectedDate, // Date object
        description: formData.description || undefined, // Optional
        categoryId: formData.categoryId || undefined, // Optional, only if selected
        userId: user.id, // Required by schema
        isPaid: false // Required by schema, new bills start as unpaid
      });

      setLocation("/bills");
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary">
      {/* Header */}
      <div className="bg-primary/80 backdrop-blur-sm border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/bills")}
              className="text-primary-foreground hover:bg-primary-foreground/10"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">Nova Despesa</h1>
              <p className="text-primary-foreground/80">Adicione uma nova conta a pagar</p>
            </div>
            {/* Link to manage categories */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/categories")}
              className="ml-auto text-primary-foreground hover:bg-primary-foreground/10"
              data-testid="button-manage-categories"
            >
              <Plus className="w-4 h-4 mr-2" />
              Gerenciar Categorias
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Card className="max-w-2xl mx-auto stat-card">
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Conta *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Conta de luz, Aluguel, Internet..."
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="input-financial"
                  required
                  data-testid="input-name"
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Valor *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.amount}
                    onChange={(e) => updateField("amount", e.target.value)}
                    className="pl-10 input-financial"
                    required
                    data-testid="input-amount"
                  />
                </div>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="dueDate">Data de Vencimento *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left input-financial",
                        !selectedDate && "text-muted-foreground"
                      )}
                      data-testid="button-date-picker"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      locale={ptBR}
                      initialFocus
                      className="input-financial"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => updateField("categoryId", value)}
                >
                  <SelectTrigger className="input-financial" data-testid="select-category">
                    <SelectValue placeholder="Selecione uma categoria (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesLoading ? (
                      <div className="py-2 px-3 text-sm text-muted-foreground">
                        Carregando categorias...
                      </div>
                    ) : categoriesError ? (
                      <div className="py-2 px-3 text-sm text-destructive">
                        Erro ao carregar categorias
                      </div>
                    ) : categories.length === 0 ? (
                      <div className="py-2 px-3 text-sm text-muted-foreground">
                        Nenhuma categoria cadastrada
                      </div>
                    ) : (
                      categories.map((category) => {
                        const IconComponent = getIconComponent(category.icon || "wallet");
                        return (
                          <SelectItem key={category.id} value={category.id} data-testid={`category-${category.id}`}>
                            <div className="flex items-center gap-2">
                              <IconComponent 
                                className="w-4 h-4" 
                                style={{ color: category.color || "#10b981" }}
                              />
                              <span>{category.name}</span>
                            </div>
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Informações adicionais sobre esta conta..."
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="input-financial min-h-[100px] resize-none"
                  data-testid="textarea-description"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/bills")}
                  className="flex-1"
                  data-testid="button-cancel"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  className="flex-1 btn-financial"
                  disabled={isSubmitting}
                  data-testid="button-save"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewBill;