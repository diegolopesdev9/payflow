import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrendingUp, Shield, Smartphone, BarChart3 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login after a short delay for demo purposes
    const timer = setTimeout(() => {
      navigate("/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="animate-fade-in">
            <h1 className="text-6xl font-bold text-primary-foreground mb-4">
              Finanças
            </h1>
            <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Controle suas contas a pagar de forma inteligente e nunca mais se esqueça de um vencimento.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => navigate("/login")}
                className="btn-secondary-financial px-8 py-6 text-lg"
              >
                Entrar
              </Button>
              <Button 
                onClick={() => navigate("/register")}
                variant="outline"
                className="px-8 py-6 text-lg border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              >
                Criar Conta
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
          <div className="fin-card text-center">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Controle Total</h3>
            <p className="text-muted-foreground text-sm">
              Acompanhe todas suas contas a pagar em um só lugar
            </p>
          </div>

          <div className="fin-card text-center">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Seguro</h3>
            <p className="text-muted-foreground text-sm">
              Seus dados financeiros protegidos com tecnologia avançada
            </p>
          </div>

          <div className="fin-card text-center">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Mobile First</h3>
            <p className="text-muted-foreground text-sm">
              Acesse suas finanças de qualquer lugar, a qualquer hora
            </p>
          </div>

          <div className="fin-card text-center">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Relatórios</h3>
            <p className="text-muted-foreground text-sm">
              Visualize seus gastos com gráficos e relatórios detalhados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
