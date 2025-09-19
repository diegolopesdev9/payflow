import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Plus, 
  Filter, 
  Home,
  CreditCard,
  TrendingUp,
  User,
  Calendar,
  DollarSign,
  Clock,
  Check
} from "lucide-react";
import { useLocation } from "wouter";

const Bills = () => {
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("todas");

  const bills = [
    {
      id: 1,
      description: "Aluguel",
      amount: 1200.00,
      dueDate: "15/07/2024",
      category: "Moradia",
      status: "pending",
      priority: "high"
    },
    {
      id: 2,
      description: "Internet",
      amount: 80.00,
      dueDate: "20/07/2024",
      category: "Telecom",
      status: "pending",
      priority: "medium"
    },
    {
      id: 3,
      description: "Energia",
      amount: 150.00,
      dueDate: "25/07/2024",
      category: "Utilidades",
      status: "pending",
      priority: "medium"
    },
    {
      id: 4,
      description: "Streaming",
      amount: 30.00,
      dueDate: "30/07/2024",
      category: "Entretenimento",
      status: "paid",
      priority: "low"
    },
    {
      id: 5,
      description: "Academia",
      amount: 89.90,
      dueDate: "05/08/2024",
      category: "Saúde",
      status: "pending",
      priority: "low"
    },
  ];

  const filterBills = (status: string) => {
    switch (status) {
      case "vencer":
        return bills.filter(bill => bill.status === "pending");
      case "pagos":
        return bills.filter(bill => bill.status === "paid");
      default:
        return bills;
    }
  };

  const filteredBills = filterBills(activeFilter).filter(bill =>
    bill.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-destructive";
      case "medium":
        return "border-l-warning";
      default:
        return "border-l-primary";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary">
      {/* Header */}
      <div className="bg-primary/80 backdrop-blur-sm border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">Contas</h1>
              <p className="text-primary-foreground/80">Gerencie suas contas a pagar</p>
            </div>
            <Button 
              onClick={() => setLocation("/bills/new")}
              className="btn-secondary-financial"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Conta
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Search and Filters */}
        <Card className="fin-card">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Pesquisar contas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 input-financial"
                />
              </div>

              {/* Filter Tabs */}
              <Tabs value={activeFilter} onValueChange={setActiveFilter}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="todas">Todas</TabsTrigger>
                  <TabsTrigger value="vencer">A Vencer</TabsTrigger>
                  <TabsTrigger value="pagos">Pagos</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Bills List */}
        <div className="space-y-4">
          {filteredBills.map((bill) => (
            <Card 
              key={bill.id} 
              className={`fin-card cursor-pointer border-l-4 ${getPriorityColor(bill.priority)} hover:shadow-lg transition-all duration-300`}
              onClick={() => setLocation(`/bills/${bill.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      {bill.status === "paid" ? (
                        <Check className="w-6 h-6 text-success" />
                      ) : (
                        <Clock className="w-6 h-6 text-warning" />
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg">{bill.description}</h3>
                      <p className="text-muted-foreground">{bill.category}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold">
                      R$ {bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{bill.dueDate}</span>
                    </div>
                    <Badge className={`mt-2 ${getStatusColor(bill.status)}`}>
                      {bill.status === "paid" ? "Pago" : "Pendente"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBills.length === 0 && (
          <Card className="fin-card text-center">
            <CardContent className="p-12">
              <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma conta encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Tente ajustar os filtros de busca" : "Comece adicionando uma nova conta"}
              </p>
              <Button 
                onClick={() => setLocation("/bills/new")}
                className="btn-financial"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Conta
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
                <Home className="w-5 h-5" />
                <span className="text-sm">Home</span>
              </button>
              <button className="nav-item active">
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
                className="nav-item"
              >
                <User className="w-5 h-5" />
                <span className="text-sm">Perfil</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bills;