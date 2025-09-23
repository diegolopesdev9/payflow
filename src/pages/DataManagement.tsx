
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Database, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DataManagement() {
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  const handleClearAllData = async () => {
    setIsClearing(true);
    try {
      const response = await fetch("/api/clear-all-data", {
        method: "DELETE",
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Dados excluídos",
          description: result.message,
          variant: "default",
        });
      } else {
        throw new Error(result.error || "Erro ao excluir dados");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir os dados",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Database className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Gerenciamento de Dados</h1>
      </div>

      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            Zona de Perigo
          </CardTitle>
          <CardDescription className="text-red-600">
            Ações irreversíveis que afetam todos os dados do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-700 mb-2">Excluir Todos os Dados</h3>
            <p className="text-sm text-red-600 mb-4">
              Esta ação irá excluir permanentemente todos os usuários, categorias e contas cadastradas no sistema. 
              Esta operação não pode ser desfeita.
            </p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2" disabled={isClearing}>
                  <Trash2 className="w-4 h-4" />
                  {isClearing ? "Excluindo..." : "Excluir Todos os Dados"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Confirmar Exclusão
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir TODOS os dados do sistema? 
                    Esta ação irá remover:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Todos os usuários cadastrados</li>
                      <li>Todas as categorias</li>
                      <li>Todas as contas e faturas</li>
                      <li>Todo o histórico de dados</li>
                    </ul>
                    <strong className="text-red-600 block mt-2">
                      Esta operação NÃO pode ser desfeita!
                    </strong>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleClearAllData}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Sim, Excluir Todos os Dados
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações sobre os Dados</CardTitle>
          <CardDescription>
            Detalhes sobre o armazenamento de dados do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Tipo de Armazenamento:</strong> PostgreSQL Database</p>
            <p><strong>Persistência:</strong> Dados são salvos permanentemente no banco</p>
            <p><strong>Backup:</strong> Dados são mantidos mesmo após reiniciar o servidor</p>
            <p><strong>Recuperação:</strong> Dados excluídos só podem ser recuperados com backup</p>
            <p><strong>ORM:</strong> Drizzle ORM para operações type-safe</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
