
import { createClient } from '@supabase/supabase-js';
import { IStorage } from './storage';
import type { User, Category, Bill, NewUser, NewCategory, NewBill } from '../shared/schema';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

// Client Supabase SIMPLES - configuração mínima
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { 
    persistSession: false, 
    autoRefreshToken: false 
  }
});

export class SupabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    return data;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) return null;
    return data;
  }

  async createUser(userData: NewUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Category operations
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

  // Bill operations
  async getBills(userId: string): Promise<Bill[]> {
    const { data, error } = await supabase
      .from('bills')
      .select('id, name, amount, due_date, is_paid, user_id, category_id, description, created_at')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    console.log('🔍 [getBills] RAW DATA do Supabase:', JSON.stringify(data?.[0], null, 2));
    console.log('🔍 [getBills] Nomes das chaves:', data?.[0] ? Object.keys(data[0]) : 'nenhum dado');
    
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
    console.log('📝 [SupabaseStorage] createBill - dados recebidos:', billData);
    
    // GARANTIR conversão para snake_case (caso routes.ts não tenha convertido)
    const billDataSnakeCase = {
      name: billData.name,
      amount: billData.amount,
      due_date: billData.due_date || billData.dueDate,  // Aceita ambos
      is_paid: billData.is_paid !== undefined ? billData.is_paid : (billData.isPaid ?? false),
      user_id: billData.user_id || billData.userId,
      category_id: billData.category_id || billData.categoryId || null,
      description: billData.description || null,
    };
    
    console.log('🔄 [SupabaseStorage] Dados convertidos para snake_case:', billDataSnakeCase);
    
    const { data, error } = await supabase
      .from('bills')
      .insert([billDataSnakeCase])
      .select()
      .single();
    
    if (error) {
      console.error('❌ [SupabaseStorage] Erro ao criar bill:', error);
      throw error;
    }
    
    console.log('✅ [SupabaseStorage] Bill criado com sucesso:', data);
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
      return { success: true, message: "Todos os dados foram excluídos com sucesso" };
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
