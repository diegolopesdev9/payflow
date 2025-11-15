import { createClient } from '@supabase/supabase-js';
import { IStorage } from './storage';
import type { User, Category, Bill, NewUser, NewCategory, NewBill } from '../shared/schema';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Cliente normal com ANON_KEY (para operações com RLS)
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { 
    persistSession: false, 
    autoRefreshToken: false 
  }
});

// Cliente admin com SERVICE_ROLE_KEY (bypassa RLS - usar com cuidado!)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { 
    persistSession: false, 
    autoRefreshToken: false 
  }
});

export class SupabaseStorage implements IStorage {
  // ========== USER OPERATIONS ==========

  async getUser(id: string): Promise<User | null> {
    console.log('👤 [getUser] Buscando usuário:', id);
    
    // ✅ USAR supabaseAdmin para bypassa RLS
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.log('❌ [getUser] Erro:', error);
      return null;
    }
    
    if (!data) {
      console.log('⚠️ [getUser] Usuário não encontrado');
      return null;
    }

    console.log('✅ [getUser] Usuário encontrado:', data.name);

    return {
      id: data.id,
      email: data.email,
      name: data.name || null,
      createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      name: data.name || null,
      createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    };
  }

  async createUser(userData: NewUser): Promise<User> {
    console.log('👤 [createUser] Criando usuário:', userData);

    // ✅ USAR supabaseAdmin para bypassa RLS
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        id: userData.id,
        email: userData.email,
        name: userData.name || null,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [createUser] Erro:', error);
      throw error;
    }

    console.log('✅ [createUser] Usuário criado:', data);

    return {
      id: data.id,
      email: data.email,
      name: data.name || null,
      createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    };
  }

  async updateUser(userId: string, updateData: { name?: string; email?: string }): Promise<User | null> {
    console.log('💾 [updateUser] Atualizando usuário:', userId, updateData);

    try {
      const payload: any = {};
      if (updateData.name !== undefined) payload.name = updateData.name;
      if (updateData.email !== undefined) payload.email = updateData.email;

      console.log('📝 [updateUser] Payload:', payload);

      // ✅ USAR supabaseAdmin para bypassa RLS
      const { data, error } = await supabaseAdmin
        .from('users')
        .update(payload)
        .eq('id', userId)
        .select();

      if (error) {
        console.error('❌ [updateUser] Erro do Supabase:', error);
        throw new Error(error.message);
      }

      // Verificar se retornou dados (agora é array)
      if (!data || data.length === 0) {
        console.log('⚠️ Nenhum usuário foi atualizado');
        return null;
      }

      const user = data[0];  // ✅ PEGAR O PRIMEIRO DO ARRAY
      console.log('✅ [updateUser] Usuário atualizado:', user);

      return {
        id: user.id,
        email: user.email,
        name: user.name || null,
        createdAt: user.created_at ? new Date(user.created_at) : new Date(),
      };
    } catch (error: any) {
      console.error('❌ [updateUser] Erro:', error);
      throw error;
    }
  }

  // ========== CATEGORY OPERATIONS ==========

  async getCategories(userId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  }

  async getCategory(id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return data;
  }

  async createCategory(categoryData: NewCategory): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert(categoryData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCategory(id: string, updates: Partial<NewCategory>): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return null;
    return data;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    return !error;
  }

  // ========== BILL OPERATIONS ==========

  async getBills(userId: string): Promise<Bill[]> {
    const { data, error } = await supabase
      .from('bills')
      .select('id, name, amount, due_date, is_paid, user_id, category_id, description, created_at')
      .eq('user_id', userId);

    if (error) throw error;

    console.log('🔍 [getBills] RAW DATA:', JSON.stringify(data?.[0], null, 2));

    return data || [];
  }

  async getBill(id: string): Promise<Bill | null> {
    const { data, error } = await supabase
      .from('bills')
      .select('id, name, amount, due_date, is_paid, user_id, category_id, description, created_at')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return data;
  }

  async createBill(billData: any): Promise<any> {
    console.log('📝 [createBill] Dados recebidos:', billData);

    const billDataSnakeCase = {
      name: billData.name,
      amount: billData.amount,
      due_date: billData.due_date || billData.dueDate,
      is_paid: billData.is_paid !== undefined ? billData.is_paid : (billData.isPaid ?? false),
      user_id: billData.user_id || billData.userId,
      category_id: billData.category_id || billData.categoryId || null,
      description: billData.description || null,
    };

    console.log('📤 [createBill] Enviando:', billDataSnakeCase);

    const { data, error } = await supabase
      .from('bills')
      .insert([billDataSnakeCase])
      .select()
      .single();

    if (error) {
      console.error('❌ [createBill] Erro:', error);
      throw error;
    }

    console.log('✅ [createBill] Criado:', data);
    return data;
  }

  async updateBill(id: string, updates: Partial<NewBill>): Promise<Bill | null> {
    const { data, error } = await supabase
      .from('bills')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return null;
    return data;
  }

  async deleteBill(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', id);

    return !error;
  }

  async getUpcomingBills(userId: string, limit = 10): Promise<Bill[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('bills')
      .select('id, name, amount, due_date, is_paid, user_id, category_id, description, created_at')
      .eq('user_id', userId)
      .eq('is_paid', false)
      .gt('due_date', now)
      .order('due_date', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async clearAllData(): Promise<{ success: boolean; message: string }> {
    try {
      await supabase.from('bills').delete().neq('id', '');
      await supabase.from('categories').delete().neq('id', '');
      await supabase.from('users').delete().neq('id', '');
      return { success: true, message: "Todos os dados foram excluídos" };
    } catch (error) {
      return { success: false, message: "Erro ao excluir dados" };
    }
  }

  // ========== ADMIN OPERATIONS ==========

  async getAdminStats(): Promise<any> {
    console.log('📊 [getAdminStats] Buscando estatísticas admin');

    try {
      // Total de usuários
      const { count: totalUsers } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Usuários ativos (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: activeUsers } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Total de contas criadas por cada usuário
      const { data: billCounts } = await supabaseAdmin
        .from('bills')
        .select('user_id');

      // Calcular média de contas por usuário
      const billsByUser: { [key: string]: number } = {};
      billCounts?.forEach((bill: any) => {
        billsByUser[bill.user_id] = (billsByUser[bill.user_id] || 0) + 1;
      });

      const avgBillsPerUser = totalUsers && totalUsers > 0
        ? Object.keys(billsByUser).length > 0
          ? Object.values(billsByUser).reduce((a, b) => a + b, 0) / Object.keys(billsByUser).length
          : 0
        : 0;

      // Usuários cadastrados nos últimos 30 dias (por dia)
      const { data: recentUsers } = await supabaseAdmin
        .from('users')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      // Agrupar por dia
      const usersByDay: { [key: string]: number } = {};
      recentUsers?.forEach((user: any) => {
        const date = new Date(user.created_at).toISOString().split('T')[0];
        usersByDay[date] = (usersByDay[date] || 0) + 1;
      });

      const growthData = Object.entries(usersByDay).map(([date, count]) => ({
        date,
        count
      }));

      console.log('✅ [getAdminStats] Stats:', {
        totalUsers,
        activeUsers,
        avgBillsPerUser: avgBillsPerUser.toFixed(1)
      });

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        avgBillsPerUser: parseFloat(avgBillsPerUser.toFixed(1)),
        growthData,
      };
    } catch (error: any) {
      console.error('❌ [getAdminStats] Erro:', error);
      throw error;
    }
  }

  async getAllUsers(limit = 100, offset = 0): Promise<any[]> {
    console.log('👥 [getAllUsers] Buscando usuários');

    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('id, email, name, created_at')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Para cada usuário, buscar contagem de contas
      const usersWithStats = await Promise.all(
        (data || []).map(async (user: any) => {
          const { count: billCount } = await supabaseAdmin
            .from('bills')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

          return {
            id: user.id,
            email: user.email,
            name: user.name || 'Não informado',
            createdAt: user.created_at,
            billCount: billCount || 0,
          };
        })
      );

      console.log('✅ [getAllUsers] Retornando', usersWithStats.length, 'usuários');
      return usersWithStats;
    } catch (error: any) {
      console.error('❌ [getAllUsers] Erro:', error);
      throw error;
    }
  }

  async getUserDetails(userId: string): Promise<any> {
    console.log('🔍 [getUserDetails] Buscando detalhes do usuário:', userId);

    try {
      // Dados do usuário
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !user) throw new Error('Usuário não encontrado');

      // Contar contas
      const { count: billCount } = await supabaseAdmin
        .from('bills')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Contar categorias
      const { count: categoryCount } = await supabaseAdmin
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      console.log('✅ [getUserDetails] Detalhes:', {
        email: user.email,
        billCount,
        categoryCount
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name || 'Não informado',
        createdAt: user.created_at,
        billCount: billCount || 0,
        categoryCount: categoryCount || 0,
      };
    } catch (error: any) {
      console.error('❌ [getUserDetails] Erro:', error);
      throw error;
    }
  }

  async deleteUserAdmin(userId: string): Promise<boolean> {
    console.log('🗑️ [deleteUserAdmin] Deletando usuário:', userId);

    try {
      // Deletar contas do usuário
      await supabaseAdmin
        .from('bills')
        .delete()
        .eq('user_id', userId);

      // Deletar categorias do usuário
      await supabaseAdmin
        .from('categories')
        .delete()
        .eq('user_id', userId);

      // Deletar usuário da tabela users
      const { error } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      console.log('✅ [deleteUserAdmin] Usuário deletado com sucesso');
      return true;
    } catch (error: any) {
      console.error('❌ [deleteUserAdmin] Erro:', error);
      throw error;
    }
  }

  async updateUserStatus(userId: string, status: 'active' | 'suspended'): Promise<boolean> {
    console.log('🔄 [updateUserStatus] Alterando status:', userId, '→', status);

    try {
      const { error } = await supabaseAdmin
        .from('users')
        .update({ status })
        .eq('id', userId);

      if (error) throw error;

      console.log('✅ [updateUserStatus] Status atualizado com sucesso');
      return true;
    } catch (error: any) {
      console.error('❌ [updateUserStatus] Erro:', error);
      throw error;
    }
  }

  async getUserActivity(userId: string): Promise<any> {
    console.log('📊 [getUserActivity] Buscando atividade do usuário:', userId);

    try {
      // Buscar dados do usuário
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('created_at, status')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Contar contas por status
      const { data: bills } = await supabaseAdmin
        .from('bills')
        .select('is_paid, created_at, amount')
        .eq('user_id', userId);

      const paidBills = bills?.filter(b => b.is_paid).length || 0;
      const unpaidBills = bills?.filter(b => !b.is_paid).length || 0;
      const totalAmount = bills?.reduce((sum, b) => sum + (b.amount / 100), 0) || 0;

      // Buscar última conta criada
      const { data: lastBill } = await supabaseAdmin
        .from('bills')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Contar categorias
      const { count: categoryCount } = await supabaseAdmin
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      console.log('✅ [getUserActivity] Atividade:', {
        totalBills: bills?.length || 0,
        paidBills,
        unpaidBills
      });

      return {
        accountStatus: user.status || 'active',
        memberSince: user.created_at,
        lastActivity: lastBill?.created_at || user.created_at,
        totalBills: bills?.length || 0,
        paidBills,
        unpaidBills,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        categoryCount: categoryCount || 0,
      };
    } catch (error: any) {
      console.error('❌ [getUserActivity] Erro:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string): Promise<boolean> {
    console.log('📧 [sendPasswordResetEmail] Enviando email para:', email);

    try {
      // Usar Supabase Auth para enviar email de reset
      const { error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email,
      });

      if (error) throw error;

      console.log('✅ [sendPasswordResetEmail] Email enviado com sucesso');
      return true;
    } catch (error: any) {
      console.error('❌ [sendPasswordResetEmail] Erro:', error);
      throw error;
    }
  }
}

export const supabaseStorage = new SupabaseStorage();

export const supabaseServer = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);