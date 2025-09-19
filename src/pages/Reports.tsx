import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  PieChart,
  Calendar,
  DollarSign,
  Home,
  CreditCard,
  User,
  Filter
} from "lucide-react";

const Reports = () => {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("mensal");

  const monthlyData = {
    total: 1250.00,
    change: 12,
    trend: "up",
    average: 41.67,
    categories: [
      { name: "Moradia", amount: 500.00, percentage: 40, color: "bg-primary" },
      { name: "Alimentação", amount: 300.00, percentage: 24, color: "bg-secondary" },
      { name: "Transporte", amount: 200.00, percentage: 16, color: "bg-accent" },
      { name: "Entretenimento", amount: 150.00, percentage: 12, color: "bg-warning" },
      { name: "Outros", amount: 100.00, percentage: 8, color: "bg-muted" }
    ]
  };

  const monthlyExpenses = [
    { month: "Jan", amount: 1100 },
    { month: "Fev", amount: 1200 },
    { month: "Mar", amount: 1150 },
    { month: "Abr", amount: 1300 },
    { month: "Mai", amount: 1250 },
    { month: "Jun", amount: 1400 },
    { month: "Jul", amount: 1250 },
    { month: "Ago", amount: 1350 },
    { month: "Set", amount: 1200 },
    { month: "Out", amount: 1100 },
    { month: "Nov", amount: 1000 },
    { month: "Dez", amount: 1300 }
  ];

  const maxAmount = Math.max(...monthlyExpenses.map(m => m.amount));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary">
      {/* Header */}
      <div className="bg-primary/80 backdrop-blur-sm border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">Relatórios</h1>
              <p className="text-primary-foreground/80">Análise detalhada dos seus gastos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Tabs with Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Period Tabs */}
          <Card className="fin-card">
            <CardContent className="p-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="mensal">Mensal</TabsTrigger>
                <TabsTrigger value="anual">Anual</TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          <TabsContent value="mensal" className="space-y-6">
            {/* Monthly Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="stat-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Despesas Mensais
                    </CardTitle>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      +{monthlyData.change}% <TrendingUp className="w-3 h-3 ml-1" />
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-3xl font-bold text-foreground">
                        R$ {monthlyData.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <p className="text-muted-foreground">Jan - Dez</p>
                    </div>

                    {/* Monthly Chart */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-6 gap-1">
                        {monthlyExpenses.slice(0, 6).map((month, index) => (
                          <div key={month.month} className="text-center">
                            <div className="text-xs text-muted-foreground mb-1">{month.month}</div>
                            <div 
                              className="bg-secondary rounded-t-md transition-all duration-500 ease-out min-h-[10px]"
                              style={{ 
                                height: `${(month.amount / maxAmount) * 40}px`,
                                animationDelay: `${index * 100}ms`
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-6 gap-1">
                        {monthlyExpenses.slice(6, 12).map((month, index) => (
                          <div key={month.month} className="text-center">
                            <div className="text-xs text-muted-foreground mb-1">{month.month}</div>
                            <div 
                              className="bg-secondary rounded-t-md transition-all duration-500 ease-out min-h-[10px]"
                              style={{ 
                                height: `${(month.amount / maxAmount) * 40}px`,
                                animationDelay: `${(index + 6) * 100}ms`
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Gastos por Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-3xl font-bold text-foreground">
                        R$ {monthlyData.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <p className="text-muted-foreground">Total do mês</p>
                    </div>

                    <div className="space-y-3">
                      {monthlyData.categories.map((category) => (
                        <div key={category.name} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{category.name}</span>
                            <span className="text-muted-foreground">
                              R$ {category.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={category.percentage} 
                              className="flex-1 h-2"
                            />
                            <span className="text-xs text-muted-foreground w-10">
                              {category.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="stat-card">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">
                    R$ {monthlyData.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-muted-foreground">Total gasto</div>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="text-2xl font-bold">
                    R$ {monthlyData.average.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-muted-foreground">Média diária</div>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-success" />
                  </div>
                  <div className="text-2xl font-bold text-success">+{monthlyData.change}%</div>
                  <div className="text-sm text-muted-foreground">vs mês anterior</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="anual" className="space-y-6">
            <Card className="stat-card">
              <CardContent className="p-12 text-center">
                <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Relatório Anual</h3>
                <p className="text-muted-foreground">
                  Visualização dos gastos anuais em desenvolvimento
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-4 gap-1">
              <button 
                onClick={() => navigate("/dashboard")}
                className="nav-item"
              >
                <Home className="w-5 h-5" />
                <span className="text-sm">Home</span>
              </button>
              <button 
                onClick={() => navigate("/bills")}
                className="nav-item"
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-sm">Contas</span>
              </button>
              <button className="nav-item active">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm">Relatórios</span>
              </button>
              <button 
                onClick={() => navigate("/profile")}
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

export default Reports;