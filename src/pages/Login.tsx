import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth"; // Import useAuth
import { Shield } from "lucide-react"; // Import Shield for the icon


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [error, setError] = useState("");
  const { isAdmin } = useAuth(); // Get isAdmin from useAuth


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Clear previous errors

    try {
      // Use Supabase's signInWithPassword method
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Display Supabase error
        toast({
          title: "Erro de login",
          description: error.message || "Credenciais inválidas.",
          variant: "destructive",
        });
      } else if (data.user) {
        // Handle successful login
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta ao PagueFlow.",
        });

        // Navigate after a short delay to allow toast to be visible
        setTimeout(() => {
          setLocation("/dashboard");
        }, 1000);
      }
    } catch (err) {
      // Catch any unexpected errors
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor. Tente novamente.",
        variant: "destructive",
      });
      // Also set local error state for potential display within the form if needed
      setError("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary flex items-center justify-center p-4 relative"> {/* Added relative for absolute positioning */}
      {/* Admin Button - Conditionally rendered */}
      {isAdmin && (
        <div className="absolute top-4 right-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation("/admin")}
            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            title="Painel do Admin"
          >
            <Shield className="h-5 w-5" />
          </Button>
        </div>
      )}

      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-foreground mb-2">
            PagueFlow
          </h1>
          <p className="text-primary-foreground/80">
            Controle suas contas de forma inteligente
          </p>
        </div>

        <Card className="fin-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Entre na sua conta
            </CardTitle>
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

              {/* Display form-level error if any */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

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