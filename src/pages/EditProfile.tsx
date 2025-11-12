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
import { ArrowLeft, Save, X, User as UserIcon, Mail } from "lucide-react";

const EditProfile = () => {
  const [location, setLocation] = useLocation();
  const { user, authenticated } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });

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

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      console.log('📤 [EditProfile] Enviando atualização:', data);
      const response = await fetchWithAuth('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar perfil');
      }
      const result = await response.json();
      console.log('✅ [EditProfile] Resposta do servidor:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('✅ [EditProfile] Atualização bem-sucedida, data:', data);

      // ✅ ATUALIZAR CACHE MANUALMENTE com os dados do servidor
      const userData = data?.user ?? data;
      queryClient.setQueryData(['/api/users/me'], userData);
      console.log('✅ [EditProfile] Cache atualizado com:', userData);

      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });

      // Redirecionar
      setTimeout(() => {
        setLocation('/profile');
      }, 100);
    },
    onError: (error: any) => {
      console.error('❌ [EditProfile] Erro:', error);
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (authenticated === false) {
      setLocation("/login");
    }
  }, [authenticated, setLocation]);

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

  if (authenticated === null || (authenticated && !user) || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary flex items-center justify-center">
        <div className="text-primary-foreground text-lg">Carregando perfil...</div>
      </div>
    );
  }

  if (authenticated && user && profileError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="text-primary-foreground text-lg mb-4">
            Erro ao carregar dados do perfil
          </div>
          <button 
            onClick={() => setLocation("/profile")}
            className="text-primary-foreground underline"
          >
            Voltar para Perfil
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 [EditProfile] Iniciando atualização...');
    updateProfileMutation.mutate(formData);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary">
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
        <Card className="max-w-2xl mx-auto stat-card">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                />
              </div>

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
                />
              </div>

              <div className="flex gap-4 pt-6">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/profile")}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>

                <Button 
                  type="submit" 
                  className="flex-1 btn-financial"
                  disabled={updateProfileMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar alterações'}
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