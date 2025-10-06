
import { useState, useEffect } from 'react';
import { fetchWithAuth, useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import type { Bill } from '@shared/schema';

// Bill type is now imported from shared/schema.ts to ensure consistency
// Add computed priority field locally
export interface BillWithPriority extends Bill {
  priority?: 'low' | 'medium' | 'high';
}

export const useBills = () => {
  const { user, authenticated } = useAuth();
  const { toast } = useToast();
  const [bills, setBills] = useState<BillWithPriority[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBills = async () => {
    if (!authenticated || !user?.id) return;

    try {
      setLoading(true);
      const response = await fetchWithAuth(`/api/bills?userId=${user.id}`);
      const data = await response.json();
      
      // Adicionar prioridade baseada na proximidade do vencimento
      const billsWithPriority = data.map((bill: any) => {
        const dueDate = new Date(bill.dueDate);
        const today = new Date();
        const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        let priority: 'low' | 'medium' | 'high' = 'low';
        if (daysLeft <= 3) priority = 'high';
        else if (daysLeft <= 7) priority = 'medium';
        
        return {
          ...bill,
          priority,
          dueDate: bill.dueDate // Manter formato ISO para cálculos
        };
      });
      
      setBills(billsWithPriority);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
      toast({
        title: "Erro ao carregar contas",
        description: "Não foi possível carregar suas contas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createBill = async (billData: Omit<Bill, 'id' | 'createdAt'>) => {
    try {
      const response = await fetchWithAuth('/api/bills', {
        method: 'POST',
        body: JSON.stringify(billData),
      });

      if (response.ok) {
        const newBill = await response.json();
        setBills(prev => [...prev, newBill]);
        toast({
          title: "Conta criada com sucesso!",
          description: `${billData.name} foi adicionada às suas contas.`,
        });
        return newBill;
      } else {
        throw new Error('Falha ao criar conta');
      }
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      toast({
        title: "Erro ao criar conta",
        description: "Não foi possível criar a conta. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateBill = async (billId: string, updates: Partial<Bill>) => {
    try {
      const response = await fetchWithAuth(`/api/bills/${billId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedBill = await response.json();
        setBills(prev => prev.map(bill => bill.id === billId ? updatedBill : bill));
        toast({
          title: "Conta atualizada com sucesso!",
        });
        return updatedBill;
      } else {
        throw new Error('Falha ao atualizar conta');
      }
    } catch (error) {
      console.error('Erro ao atualizar conta:', error);
      toast({
        title: "Erro ao atualizar conta",
        description: "Não foi possível atualizar a conta. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteBill = async (billId: string) => {
    try {
      const response = await fetchWithAuth(`/api/bills/${billId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBills(prev => prev.filter(bill => bill.id !== billId));
        toast({
          title: "Conta excluída com sucesso!",
        });
        return true;
      } else {
        throw new Error('Falha ao excluir conta');
      }
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      toast({
        title: "Erro ao excluir conta",
        description: "Não foi possível excluir a conta. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getUpcomingBills = (limit?: number) => {
    const upcoming = bills
      .filter(bill => !bill.isPaid)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    
    return limit ? upcoming.slice(0, limit) : upcoming;
  };

  const getTotalToPay = () => {
    return bills
      .filter(bill => !bill.isPaid)
      .reduce((sum, bill) => sum + (bill.amount / 100), 0); // Convert from cents
  };

  const getTotalPaid = () => {
    return bills
      .filter(bill => bill.isPaid)
      .reduce((sum, bill) => sum + (bill.amount / 100), 0); // Convert from cents
  };

  useEffect(() => {
    fetchBills();
  }, [authenticated, user?.id]);

  return {
    bills,
    loading,
    fetchBills,
    createBill,
    updateBill,
    deleteBill,
    getUpcomingBills,
    getTotalToPay,
    getTotalPaid,
  };
};
