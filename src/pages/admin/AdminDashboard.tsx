import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth, fetchWithAuth } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  TrendingUp,
  Activity,
  ArrowLeft,
  Search,
  Trash2,
  Eye,
  Shield,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const AdminDashboard = () => {
  const [location, setLocation] = useLocation();
  const { user, authenticated, isAdmin } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [userActivity, setUserActivity] = useState<any>(null);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // Redirect se não for admin
  useEffect(() => {
    if (authenticated === false) {
      setLocation("/login");
    } else if (authenticated === true && !isAdmin) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta área.",
        variant: "destructive",
      });
      setLocation("/dashboard");
    }
  }, [authenticated, isAdmin, setLocation]);

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await fetchWithAuth('/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    enabled: authenticated === true && isAdmin,
  });

  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await fetchWithAuth('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    enabled: authenticated === true && isAdmin,
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetchWithAuth(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "Usuário deletado",
        description: "O usuário foi removido com sucesso.",
      });
      setShowDeleteDialog(false);
      setUserToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao deletar",
        description: error.message || "Não foi possível deletar o usuário.",
        variant: "destructive",
      });
    },
  });

  // Suspend/Activate user mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: 'active' | 'suspended' }) => {
      const response = await fetchWithAuth(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: variables.status === 'suspended' ? "Usuário suspenso" : "Usuário reativado",
        description: `O status foi alterado com sucesso.`,
      });
      // Atualizar dados locais
      if (selectedUser) {
        fetchUserDetails(selectedUser.id);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao alterar status",
        description: error.message || "Não foi possível alterar o status.",
        variant: "destructive",
      });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetchWithAuth(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to send reset email');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email enviado",
        description: "Email de redefinição de senha enviado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar email",
        description: error.message || "Não foi possível enviar o email.",
        variant: "destructive",
      });
    },
  });

  // Fetch user details
  const fetchUserDetails = async (userId: string) => {
    try {
      setLoadingActivity(true);
      
      // Buscar detalhes básicos
      const detailsResponse = await fetchWithAuth(`/api/admin/users/${userId}`);
      if (!detailsResponse.ok) throw new Error('Failed to fetch user details');
      const details = await detailsResponse.json();
      setSelectedUser(details);
      
      // Buscar atividades
      const activityResponse = await fetchWithAuth(`/api/admin/users/${userId}/activity`);
      if (!activityResponse.ok) throw new Error('Failed to fetch activity');
      const activity = await activityResponse.json();
      setUserActivity(activity);
      
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes do usuário.",
        variant: "destructive",
      });
    } finally {
      setLoadingActivity(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Filter users by search
  const filteredUsers = users.filter((u: any) =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authenticated === null || !user || authenticated === false || !isAdmin) {
    return null;
  }

  if (statsLoading || usersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center">
        <div className="text-white text-lg">Carregando painel admin...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900">
      {/* Header */}
      <div className="bg-blue-900/80 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/dashboard")}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-yellow-400" />
                <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
              </div>
              <p className="text-white/80">Gerencie usuários e visualize estatísticas</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/60">Admin</p>
              <p className="text-white font-medium">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/95 backdrop-blur shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Total de Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                {stats?.totalUsers || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">Cadastrados no sistema</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-600" />
                Usuários Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {stats?.activeUsers || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">Últimos 30 dias</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                Média de Contas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">
                {stats?.avgBillsPerUser || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">Por usuário</p>
            </CardContent>
          </Card>
        </div>

        {/* Growth Chart */}
        {stats?.growthData && stats.growthData.length > 0 && (
          <Card className="bg-white/95 backdrop-blur shadow-xl">
            <CardHeader>
              <CardTitle className="text-gray-900">Crescimento de Usuários (Últimos 30 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-2 h-40 bg-gray-50 rounded-lg p-4">
                {stats.growthData.map((item: any, index: number) => {
                  const maxCount = Math.max(...stats.growthData.map((d: any) => d.count));
                  const heightPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex items-end justify-center relative" style={{ height: '128px' }}>
                        <div
                          className="w-full bg-blue-600 rounded-t transition-all hover:bg-blue-700 cursor-pointer"
                          style={{
                            height: `${Math.max(heightPercent, 5)}%`,
                            minHeight: '8px'
                          }}
                          title={`${new Date(item.date).toLocaleDateString('pt-BR')}: ${item.count} usuário(s)`}
                        />
                      </div>
                      <span className="text-xs text-gray-600">
                        {new Date(item.date).getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Table */}
        <Card className="bg-white/95 backdrop-blur shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">Usuários Cadastrados</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Nome</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Email</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Cadastro</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Contas</th>
                    <th className="text-right p-3 text-sm font-medium text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-gray-500">
                        Nenhum usuário encontrado
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u: any) => (
                      <tr key={u.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <span className="font-medium text-gray-900">{u.name}</span>
                        </td>
                        <td className="p-3 text-gray-600">{u.email}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            u.status === 'suspended'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {u.status === 'suspended' ? '🔴 Suspenso' : '🟢 Ativo'}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600">{formatDate(u.createdAt)}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {u.billCount} contas
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => fetchUserDetails(u.id)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setUserToDelete(u);
                                setShowDeleteDialog(true);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => {
        setSelectedUser(null);
        setUserActivity(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Detalhes do Usuário
              {userActivity && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  userActivity.accountStatus === 'suspended' 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {userActivity.accountStatus === 'suspended' ? '🔴 Suspenso' : '🟢 Ativo'}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {loadingActivity ? (
            <div className="py-8 text-center text-gray-500">
              Carregando detalhes...
            </div>
          ) : selectedUser && userActivity ? (
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nome</p>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Membro desde</p>
                  <p className="font-medium">{formatDate(userActivity.memberSince)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Última atividade</p>
                  <p className="font-medium">{formatDate(userActivity.lastActivity)}</p>
                </div>
              </div>

              <Separator />

              {/* Estatísticas de Uso */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-900">Estatísticas de Uso</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Total de Contas</p>
                    <p className="text-2xl font-bold text-blue-600">{userActivity.totalBills}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Pagas</p>
                    <p className="text-2xl font-bold text-green-600">{userActivity.paidBills}</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Pendentes</p>
                    <p className="text-2xl font-bold text-red-600">{userActivity.unpaidBills}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Categorias Criadas</p>
                  <p className="text-2xl font-bold text-purple-600">{userActivity.categoryCount}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-orange-600">
                    R$ {userActivity.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Ações Admin */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-900">Ações Administrativas</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => toggleStatusMutation.mutate({
                      userId: selectedUser.id,
                      status: userActivity.accountStatus === 'suspended' ? 'active' : 'suspended'
                    })}
                    disabled={toggleStatusMutation.isPending}
                    className={userActivity.accountStatus === 'suspended' 
                      ? 'border-green-500 text-green-600 hover:bg-green-50'
                      : 'border-red-500 text-red-600 hover:bg-red-50'
                    }
                  >
                    {userActivity.accountStatus === 'suspended' ? '✓ Reativar Conta' : '⊗ Suspender Conta'}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => resetPasswordMutation.mutate(selectedUser.id)}
                    disabled={resetPasswordMutation.isPending}
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    🔑 Resetar Senha
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedUser(null);
                      setUserActivity(null);
                      setUserToDelete(selectedUser);
                      setShowDeleteDialog(true);
                    }}
                    className="border-red-500 text-red-600 hover:bg-red-50 col-span-2"
                  >
                    🗑️ Deletar Usuário
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedUser(null);
                setUserActivity(null);
              }}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar o usuário <strong>{userToDelete?.name}</strong>?
              Esta ação é irreversível e todos os dados do usuário serão perdidos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setUserToDelete(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate(userToDelete?.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deletando..." : "Deletar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;