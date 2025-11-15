import { Hono } from "hono";
import { requireUser } from "./supabaseAuth";
import { requireAdmin } from "./adminAuth";
import type { Context } from "hono";
import { SupabaseStorage } from "./supabase";

export const app = new Hono();
const storage = new SupabaseStorage();

// Função auxiliar para converter Bill de snake_case (banco) para camelCase (frontend)
function convertBillToFrontend(bill: any) {
  return {
    id: bill.id,
    name: bill.name,
    amount: bill.amount,
    dueDate: bill.due_date || bill.duedate || bill.dueDate,  // Aceita múltiplos formatos
    isPaid: bill.is_paid ?? bill.ispaid ?? bill.isPaid ?? false,
    userId: bill.user_id || bill.userid || bill.userId,
    categoryId: bill.category_id || bill.categoryid || bill.categoryId,
    description: bill.description,
    createdAt: bill.created_at || bill.createdat || bill.createdAt,
  };
}

// Health check endpoint for Render
app.get("/api/healthz", (c) => {
  return c.json({ ok: true, timestamp: new Date().toISOString(), service: "PagueFlow API" });
});

// Auth routes
app.get("/api/whoami", requireUser, (c: Context) => {
  const user = c.get("user");
  return c.json({ user });
});

app.get("/api/users/me", requireUser, async (c: Context) => {
  const userId = c.get("userId") as string;
  
  console.log('👤 [GET /api/users/me] Buscando usuário:', userId);
  
  try {
    // Buscar dados da tabela public.users
    const userData = await storage.getUser(userId);
    
    if (!userData) {
      console.log('⚠️ [GET /api/users/me] Usuário não encontrado na tabela users');
      // Se não existe, pegar do auth e criar
      const authUser = c.get("user");
      const newUser = await storage.createUser({
        id: userId,
        email: authUser.email,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuário',
      });
      console.log('✅ [GET /api/users/me] Usuário criado:', newUser);
      return c.json({ user: newUser });
    }
    
    console.log('✅ [GET /api/users/me] Dados retornados:', userData);
    return c.json({ user: userData });
  } catch (error: any) {
    console.error('❌ [GET /api/users/me] Erro:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update user profile
app.put("/api/users/me", requireUser, async (c: Context) => {
  try {
    const userId = c.get("userId") as string;
    const body = await c.req.json();
    const { name, email } = body;

    console.log('🔄 [PUT /api/users/me] INÍCIO');
    console.log('👤 userId:', userId);
    console.log('📝 Body recebido:', body);
    console.log('📝 Dados para atualizar:', { name, email });

    // Validate input
    if (!name || !email) {
      console.log('❌ Validação falhou: nome ou email ausente');
      return c.json({ error: "Nome e email são obrigatórios" }, 400);
    }

    // Check if email is already in use by another user
    if (email) {
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        console.log('❌ Email já em uso por outro usuário:', existingUser.id);
        return c.json({ error: "Este email já está em uso" }, 400);
      }
    }

    // Try to update user
    console.log('💾 Tentando atualizar usuário...');
    let updatedUser = await storage.updateUser(userId, { name, email });

    // If user doesn't exist, create it
    if (!updatedUser) {
      console.log('⚠️ Usuário não existe, criando...');
      try {
        const newUser = await storage.createUser({
          id: userId,
          email: email,
          name: name,
        });
        console.log('✅ Usuário criado:', newUser);
        return c.json({ user: newUser });
      } catch (createError: any) {
        console.error('❌ Erro ao criar usuário:', createError);
        return c.json({ error: "Erro ao criar usuário" }, 500);
      }
    }

    console.log('✅ [PUT /api/users/me] Usuário atualizado com sucesso:', updatedUser);
    return c.json({ user: updatedUser });
  } catch (error: any) {
    console.error('❌ [PUT /api/users/me] Erro ao atualizar usuário:', error);
    return c.json({ error: error.message || "Erro ao atualizar perfil" }, 500);
  }
});

// ============ CATEGORIES ============
app.get("/api/categories", requireUser, async (c: Context) => {
  console.log('\n🔍 GET /api/categories - INÍCIO');

  const userId = c.get("userId") as string;
  console.log('👤 userId:', userId);

  try {
    console.log('📞 Chamando storage.getCategories...');
    const categories = await storage.getCategories(userId);
    console.log('✅ Categorias retornadas:', categories?.length || 0);
    console.log('📦 Categorias:', JSON.stringify(categories, null, 2));
    return c.json(categories);
  } catch (error) {
    console.error('❌ ERRO ao buscar categorias:', error);
    throw error;
  }
});

app.post("/api/categories", requireUser, async (c: Context) => {
  console.log('\n🔵 POST /api/categories - INÍCIO');

  const userId = c.get("userId") as string;
  console.log('👤 userId:', userId);

  const body = await c.req.json();
  console.log('📦 body recebido:', JSON.stringify(body, null, 2));

  // Converter para snake_case para o Supabase
  const categoryData = {
    name: body.name,
    color: body.color || null,
    icon: body.icon || null,
    user_id: userId,
  };

  console.log('📄 categoryData convertido:', JSON.stringify(categoryData, null, 2));
  console.log('📞 Chamando storage.createCategory...');

  try {
    const category = await storage.createCategory(categoryData);
    console.log('✅ Categoria criada com sucesso:', category);
    return c.json(category, 201);
  } catch (error) {
    console.error('❌ ERRO ao criar categoria:', error);
    throw error;
  }
});

app.put("/api/categories/:id", requireUser, async (c: Context) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const category = await storage.updateCategory(id, body);
  if (!category) return c.json({ error: "Categoria não encontrada" }, 404);
  return c.json(category);
});

app.delete("/api/categories/:id", requireUser, async (c: Context) => {
  const id = c.req.param("id");
  const deleted = await storage.deleteCategory(id);
  if (!deleted) return c.json({ error: "Categoria não encontrada" }, 404);
  return c.json({ message: "Categoria removida" });
});

// ============ BILLS ============
app.get("/api/bills", requireUser, async (c: Context) => {
  const userId = c.get("userId") as string;

  console.log('\n📊 GET /api/bills - INÍCIO');
  console.log('👤 userId:', userId);

  const bills = await storage.getBills(userId);

  console.log('📦 Bills do storage (ANTES conversão):', bills.length);
  console.log('📦 Primeira bill (ANTES):', JSON.stringify(bills[0], null, 2));

  // Converter de snake_case (banco) para camelCase (frontend)
  const convertedBills = bills.map(convertBillToFrontend);

  console.log('✅ Bills convertidas (DEPOIS conversão):', convertedBills.length);
  console.log('✅ Primeira bill (DEPOIS):', JSON.stringify(convertedBills[0], null, 2));
  console.log('✅ Keys da primeira bill:', convertedBills[0] ? Object.keys(convertedBills[0]) : 'nenhuma');

  return c.json(convertedBills);
});

app.get("/api/bills/upcoming", requireUser, async (c: Context) => {
  const userId = c.get("userId") as string;
  const allBills = await storage.getBills(userId);
  const today = new Date();
  // Usar snake_case porque os dados vêm direto do banco
  const upcoming = allBills
    .filter(b => !b.is_paid && new Date(b.due_date) >= today)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 10)
    .map(convertBillToFrontend);  // Converter para camelCase antes de retornar
  return c.json(upcoming);
});

app.get("/api/bills/:id", requireUser, async (c: Context) => {
  const id = c.req.param("id");
  const bill = await storage.getBill(id);
  if (!bill) return c.json({ error: "Conta não encontrada" }, 404);
  // Converter para camelCase antes de retornar
  return c.json(convertBillToFrontend(bill));
});

app.post("/api/bills", requireUser, async (c: Context) => {
  console.log('\n🔵 POST /api/bills - INÍCIO');

  const userId = c.get("userId") as string;
  console.log('👤 userId:', userId);

  const body = await c.req.json();
  console.log('📦 body recebido:', JSON.stringify(body, null, 2));

  // Converter de camelCase (frontend) para snake_case (banco Supabase)
  const billData = {
    name: body.name,
    amount: body.amount,
    due_date: body.dueDate,
    is_paid: body.isPaid ?? false,
    user_id: userId,
    category_id: body.categoryId || null,
    description: body.description || null,
  };

  console.log('🔄 billData convertido:', JSON.stringify(billData, null, 2));
  console.log('📞 Chamando storage.createBill...');

  try {
    const bill = await storage.createBill(billData);
    console.log('✅ Bill criado com sucesso:', bill);
    return c.json(convertBillToFrontend(bill), 201);
  } catch (error) {
    console.error('❌ ERRO ao criar bill:', error);
    throw error;
  }
});

app.put("/api/bills/:id", requireUser, async (c: Context) => {
  console.log('\n🔵 PUT /api/bills/:id - INÍCIO');

  const id = c.req.param("id");
  const body = await c.req.json();

  console.log('📦 body recebido:', JSON.stringify(body, null, 2));

  // Converter de camelCase (frontend) para snake_case (banco)
  const updateData: any = {};

  if (body.name !== undefined) updateData.name = body.name;
  if (body.amount !== undefined) updateData.amount = body.amount;
  if (body.dueDate !== undefined) updateData.due_date = body.dueDate;
  if (body.isPaid !== undefined) updateData.is_paid = body.isPaid;
  if (body.paidAt !== undefined) updateData.paid_at = body.paidAt;
  if (body.categoryId !== undefined) updateData.category_id = body.categoryId;
  if (body.description !== undefined) updateData.description = body.description;

  console.log('📄 updateData convertido:', JSON.stringify(updateData, null, 2));
  console.log('📞 Chamando storage.updateBill...');

  try {
    const bill = await storage.updateBill(id, updateData);

    if (!bill) {
      console.log('❌ Bill não encontrado');
      return c.json({ error: "Conta não encontrada" }, 404);
    }

    console.log('✅ Bill atualizado:', bill);

    // Converter resposta para camelCase usando função existente
    return c.json(convertBillToFrontend(bill));
  } catch (error) {
    console.error('❌ ERRO ao atualizar bill:', error);
    throw error;
  }
});

app.delete("/api/bills/:id", requireUser, async (c: Context) => {
  const id = c.req.param("id");
  const deleted = await storage.deleteBill(id);
  if (!deleted) return c.json({ error: "Conta não encontrada" }, 404);
  return c.json({ message: "Conta removida" });
});

// ============ REPORTS ============
app.get("/api/reports/summary", requireUser, async (c: Context) => {
  return c.json({ message: "Relatórios em desenvolvimento" });
});

// ============ ADMIN ROUTES ============
app.get("/api/admin/stats", requireAdmin, async (c: Context) => {
  console.log('📊 GET /api/admin/stats');

  try {
    const stats = await storage.getAdminStats();
    return c.json(stats);
  } catch (error: any) {
    console.error('❌ Erro ao buscar stats:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.get("/api/admin/users", requireAdmin, async (c: Context) => {
  console.log('👥 GET /api/admin/users');

  try {
    const limit = parseInt(c.req.query('limit') || '100');
    const offset = parseInt(c.req.query('offset') || '0');

    const users = await storage.getAllUsers(limit, offset);
    return c.json(users);
  } catch (error: any) {
    console.error('❌ Erro ao buscar usuários:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.get("/api/admin/users/:id", requireAdmin, async (c: Context) => {
  const userId = c.req.param('id');
  console.log('🔍 GET /api/admin/users/:id', userId);

  try {
    const userDetails = await storage.getUserDetails(userId);
    return c.json(userDetails);
  } catch (error: any) {
    console.error('❌ Erro ao buscar detalhes:', error);
    return c.json({ error: error.message }, 404);
  }
});

app.delete("/api/admin/users/:id", requireAdmin, async (c: Context) => {
  const userId = c.req.param('id');
  console.log('🗑️ DELETE /api/admin/users/:id', userId);

  try {
    const deleted = await storage.deleteUserAdmin(userId);
    if (!deleted) {
      return c.json({ error: 'Usuário não encontrado' }, 404);
    }
    return c.json({ message: 'Usuário deletado com sucesso' });
  } catch (error: any) {
    console.error('❌ Erro ao deletar usuário:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default app;