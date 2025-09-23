
-- Execute este SQL no SQL Editor do Supabase Dashboard

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela users
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Criar tabela categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  icon TEXT DEFAULT 'CreditCard',
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL
);

-- Criar tabela bills
CREATE TABLE IF NOT EXISTS bills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  due_date TIMESTAMP NOT NULL,
  is_paid BOOLEAN DEFAULT false,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(due_date);
CREATE INDEX IF NOT EXISTS idx_bills_is_paid ON bills(is_paid);

-- Habilitar Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS (opcional - para segurança adicional)
-- Os usuários só podem ver/editar seus próprios dados

-- Política para categories
CREATE POLICY "Users can view own categories" ON categories
  FOR SELECT USING (auth.uid()::text = user_id::text);
  
CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
  
CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (auth.uid()::text = user_id::text);
  
CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Política para bills
CREATE POLICY "Users can view own bills" ON bills
  FOR SELECT USING (auth.uid()::text = user_id::text);
  
CREATE POLICY "Users can insert own bills" ON bills
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
  
CREATE POLICY "Users can update own bills" ON bills
  FOR UPDATE USING (auth.uid()::text = user_id::text);
  
CREATE POLICY "Users can delete own bills" ON bills
  FOR DELETE USING (auth.uid()::text = user_id::text);
