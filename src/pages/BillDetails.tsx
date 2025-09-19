import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Check,
  Calendar,
  DollarSign,
  Tag,
  Clock,
  Home
} from "lucide-react";

const BillDetails = () => {
  const { id } = useParams();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Mock data - in real app this would come from API
  const bill = {
    id: 1,
    description: "Aluguel do apartamento",
    amount: 1500.00,
    dueDate: "10 de cada mês",
    category: "Moradia",
    frequency: "Mensal",
    status: "pending",
    notes: "Pagamento do aluguel do apartamento na Rua das Flores, 123",
    createdAt: "2024-01-10",
    lastPayment: "2024-06-10"
  };

  const handleMarkAsPaid = () => {
    toast({
      title: "Conta marcada como paga!",
      description: "A conta foi atualizada com sucesso.",
    });
  };

  const handleEdit = () => {
    setLocation(`/bills/${id}/edit`);
  };

  const handleDelete = () => {
    toast({
      title: "Conta excluída",
      description: "A conta foi removida com sucesso.",
      variant: "destructive",
    });
    setLocation("/bills");
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
              <h1 className="text-2xl font-bold text-primary-foreground">Detalhes da Conta</h1>
              <p className="text-primary-foreground/80">Informações detalhadas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Bill Details Card */}
        <Card className="stat-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{bill.description}</CardTitle>
              <Badge className={getStatusColor(bill.status)}>
                {bill.status === "paid" ? "Pago" : "Pendente"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount */}
            <div className="text-center py-6">
              <div className="text-4xl font-bold text-primary mb-2">
                R$ {bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-muted-foreground">Valor da conta</p>
            </div>

            <Separator />

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Vencimento</p>
                    <p className="font-semibold">{bill.dueDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Tag className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Categoria</p>
                    <p className="font-semibold">{bill.category}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Frequência</p>
                    <p className="font-semibold">{bill.frequency}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Home className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Último Pagamento</p>
                    <p className="font-semibold">{bill.lastPayment}</p>
                  </div>
                </div>
              </div>
            </div>

            {bill.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Observações</p>
                  <p className="text-foreground">{bill.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={handleEdit}
            className="btn-financial flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Editar Conta
          </Button>

          <Button 
            onClick={handleMarkAsPaid}
            variant="outline"
            className="border-success text-success hover:bg-success/10 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Marcar como Pago
          </Button>

          <Button 
            onClick={handleDelete}
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive/10 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Excluir
          </Button>
        </div>

        {/* Payment History */}
        <Card className="fin-card">
          <CardHeader>
            <CardTitle>Histórico de Pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { date: "10/06/2024", amount: 1500.00, status: "paid" },
                { date: "10/05/2024", amount: 1500.00, status: "paid" },
                { date: "10/04/2024", amount: 1500.00, status: "paid" },
              ].map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <span className="font-medium">{payment.date}</span>
                  </div>
                  <span className="font-semibold text-success">
                    R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillDetails;