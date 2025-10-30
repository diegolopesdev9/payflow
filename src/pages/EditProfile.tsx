import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth, fetchWithAuth } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { User } from "../../shared/schema";
import { ArrowLeft, Save, X, User as UserIcon, Mail, Phone, Calendar, MapPin } from "lucide-react";

const EditProfile = () => {
  const [location, setLocation] = useLocation();
  const { user, authenticated } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (authenticated === false) {
      setLocation("/login");
    }
  }, [authenticated, setLocation]);

  // Fetch user profile data
  const { data: userProfile, isLoading: profileLoading, isError: profileError } = useQuery({
    queryKey: ['/api/users/me'],
    queryFn: async () => {
      const response = await fetchWithAuth('/api/users/me');
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      return data?.user ?? data;
    },
    enabled: !!user?.id,
  });

  // Update form data when user profile loads
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        email: userProfile.email || ""
      });
    }
  }, [userProfile]);

  if (authenticated === false) {
    return null;
  }

  // Show loading while auth is resolving or profile data is loading
  if (authenticated === null || (authenticated && !user) || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary flex items-center justify-center">
        <div className="text-primary-foreground text-lg" data-testid="loading-edit-profile">Carregando perfil...</div>
      </div>
    );
  }

  // Show error if profile failed to load
  if (authenticated && user && profileError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="text-primary-foreground text-lg mb-4" data-testid="error-edit-profile">
            Erro ao carregar dados do perfil
          </div>
          <button 
            onClick={() => setLocation("/profile")}
            className="text-primary-foreground underline"
            data-testid="button-back-profile"
          >
            Voltar para Perfil
          </button>
        </div>
      </div>
    );
  }

  // Note: Update profile mutation temporarily disabled until backend endpoint is implemented
  // const updateProfileMutation = useMutation({ ... });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A edição de perfil será implementada quando o endpoint do backend estiver pronto.",
      variant: "destructive",
    });
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
              onClick={() => setLocation("/profile")}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">Editar Perfil</h1>
              <p className="text-primary-foreground/80">Atualize suas informações pessoais</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Card className="max-w-2xl mx-auto stat-card" data-testid="card-edit-profile">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Nome completo
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="input-financial"
                  required
                  data-testid="input-name"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="input-financial"
                  required
                  data-testid="input-email"
                />
              </div>

              {/* Note about limited functionality */}
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground" data-testid="text-limited-functionality">
                  <strong>Nota:</strong> Esta tela exibe dados reais do seu perfil buscados da API. A funcionalidade de edição será implementada quando o endpoint de atualização estiver disponível no backend.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/profile")}
                  className="flex-1"
                  data-testid="button-cancel"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                
                <Button 
                  type="submit" 
                  className="flex-1 btn-financial"
                  disabled={true}
                  data-testid="button-save"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar alterações (Em breve)
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProfile;