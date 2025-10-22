
import { Hono } from "hono";
import { requireUser } from "./supabaseAuth";
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

// Health check
app.get("/api/healthz", (c) => c.json({ ok: true }));

// Auth routes
app.get("/api/whoami", requireUser, (c: Context) => {
  const user = c.get("user");
  return c.json({ user });
});

app.get("/api/users/me", requireUser, (c: Context) => {
  const user = c.get("user");
  return c.json({ user });
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
  const bills = await storage.getBills(userId);
  // Converter de snake_case (banco) para camelCase (frontend)
  const convertedBills = bills.map(convertBillToFrontend);
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

export default app;
