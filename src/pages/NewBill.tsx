import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft, Save, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useBills } from "@/hooks/useBills";
import { useAuth } from "@/lib/auth";

const NewBill = () => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, authenticated } = useAuth();
  const { createBill } = useBills();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();

  // Verificar autenticação
  if (!authenticated) {
    setLocation("/login");
    return null;
  }

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    frequency: "",
    notes: ""
  });

  const categories = [
    "Moradia",
    "Alimentação",
    "Transporte",
    "Saúde",
    "Educação",
    "Entretenimento",
    "Telecom",
    "Utilidades",
    "Outros"
  ];

  const frequencies = [
    "Única",
    "Semanal",
    "Quinzenal",
    "Mensal",
    "Bimestral",
    "Trimestral",
    "Semestral",
    "Anual"
  ];

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
        description: formData.description,
        amount: parseFloat(formData.amount),
        dueDate: selectedDate.toISOString().split('T')[0], // Format YYYY-MM-DD
        category: formData.category,
        status: 'pending',
        userId: user.id
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
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">Nova Despesa</h1>
              <p className="text-primary-foreground/80">Adicione uma nova conta a pagar</p>
            </div>
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
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  id="description"
                  placeholder="Ex: Conta de luz, Aluguel, Internet..."
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="input-financial"
                  required
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

              {/* Category and Frequency Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => updateField("category", value)}
                  >
                    <SelectTrigger className="input-financial">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequência *</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => updateField("frequency", value)}
                  >
                    <SelectTrigger className="input-financial">
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencies.map((frequency) => (
                        <SelectItem key={frequency} value={frequency}>
                          {frequency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Informações adicionais sobre esta conta..."
                  value={formData.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  className="input-financial min-h-[100px] resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/bills")}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  className="flex-1 btn-financial"
                  disabled={isSubmitting}
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