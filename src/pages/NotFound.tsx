
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const [location, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary flex items-center justify-center p-4">
      <Card className="fin-card max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl font-bold text-secondary">404</span>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-4">
            Página não encontrada
          </h1>

          <p className="text-muted-foreground mb-8">
            A página que você está procurando não existe ou foi movida.
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => setLocation("/dashboard")}
              className="btn-primary-financial w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Ir para Dashboard
            </Button>

            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
