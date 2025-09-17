import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta ao FinApp.",
      });
      // Here you would typically redirect to dashboard
      window.location.href = "/dashboard";
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-foreground mb-2">Finanças</h1>
          <p className="text-primary-foreground/80">Controle suas contas de forma inteligente</p>
        </div>

        <Card className="fin-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Entre na sua conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-financial"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-financial"
                  required
                />
              </div>

              <div className="text-center">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Esqueci a Senha
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full btn-financial py-6 text-lg"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="text-center pt-4">
              <p className="text-muted-foreground">
                Não tem uma conta?{" "}
                <Link 
                  to="/register" 
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Cadastre-se
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;