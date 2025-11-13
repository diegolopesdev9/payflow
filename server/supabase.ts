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
}

export const supabaseStorage = new SupabaseStorage();

export const supabaseServer = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);