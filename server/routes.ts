
import { Hono } from "hono";
import { requireUser } from "./supabaseAuth";
import type { Context } from "hono";
import { SupabaseStorage } from "./supabase";

export const app = new Hono();
const storage = new SupabaseStorage();

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
  const userId = c.get("userId") as string;
  const categories = await storage.getCategories(userId);
  return c.json(categories);
});

app.post("/api/categories", requireUser, async (c: Context) => {
  const userId = c.get("userId") as string;
  const body = await c.req.json();
  const category = await storage.createCategory({ ...body, userId });
  return c.json(category, 201);
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
  return c.json(bills);
});

app.get("/api/bills/upcoming", requireUser, async (c: Context) => {
  const userId = c.get("userId") as string;
  const allBills = await storage.getBills(userId);
  const today = new Date();
  const upcoming = allBills.filter(b => !b.isPaid && new Date(b.dueDate) >= today).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 10);
  return c.json(upcoming);
});

app.get("/api/bills/:id", requireUser, async (c: Context) => {
  const id = c.req.param("id");
  const bill = await storage.getBill(id);
  if (!bill) return c.json({ error: "Conta não encontrada" }, 404);
  return c.json(bill);
});

app.post("/api/bills", requireUser, async (c: Context) => {
  const userId = c.get("userId") as string;
  const body = await c.req.json();
  const bill = await storage.createBill({ ...body, userId });
  return c.json(bill, 201);
});

app.put("/api/bills/:id", requireUser, async (c: Context) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const bill = await storage.updateBill(id, body);
  if (!bill) return c.json({ error: "Conta não encontrada" }, 404);
  return c.json(bill);
});

app.delete("/api/bills/:id", requireUser, async (c: Context) => {
  const id = c.req.param("id");
  const deleted = await storage.deleteBill(id);
  if (!deleted) return c.json({ error: "Conta não encontrada" }, 404);
  return c.json({ message: "Conta removida" });


// ============ REPORTS ============
app.get("/api/reports/summary", requireUser, async (c: Context) => {
  return c.json({ message: "Relatórios em desenvolvimento" });
});

export default app;

});
