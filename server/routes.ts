import { Hono } from "hono";
import { z } from "zod";
import { storage } from "./storage";
import { insertUserSchema, insertCategorySchema, insertBillSchema } from "../shared/schema";

const app = new Hono();

// User routes
app.post("/api/users", async (c) => {
  try {
    const body = await c.req.json();
    const userData = insertUserSchema.parse(body);
    const user = await storage.createUser(userData);
    return c.json(user, 201);
  } catch (error) {
    return c.json({ error: "Invalid user data" }, 400);
  }
});

app.get("/api/users/:id", async (c) => {
  const id = c.req.param("id");
  const user = await storage.getUser(id);
  
  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }
  
  return c.json(user);
});

// Category routes
app.get("/api/categories", async (c) => {
  const userId = c.req.query("userId");
  if (!userId) {
    return c.json({ error: "userId is required" }, 400);
  }
  
  const categories = await storage.getCategories(userId);
  return c.json(categories);
});

app.post("/api/categories", async (c) => {
  try {
    const body = await c.req.json();
    const categoryData = insertCategorySchema.parse(body);
    const category = await storage.createCategory(categoryData);
    return c.json(category, 201);
  } catch (error) {
    return c.json({ error: "Invalid category data" }, 400);
  }
});

app.put("/api/categories/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const body = await c.req.json();
    const updates = insertCategorySchema.partial().parse(body);
    const category = await storage.updateCategory(id, updates);
    
    if (!category) {
      return c.json({ error: "Category not found" }, 404);
    }
    
    return c.json(category);
  } catch (error) {
    return c.json({ error: "Invalid category data" }, 400);
  }
});

app.delete("/api/categories/:id", async (c) => {
  const id = c.req.param("id");
  const deleted = await storage.deleteCategory(id);
  
  if (!deleted) {
    return c.json({ error: "Category not found" }, 404);
  }
  
  return c.json({ success: true });
});

// Bill routes
app.get("/api/bills", async (c) => {
  const userId = c.req.query("userId");
  if (!userId) {
    return c.json({ error: "userId is required" }, 400);
  }
  
  const bills = await storage.getBills(userId);
  return c.json(bills);
});

app.get("/api/bills/upcoming", async (c) => {
  const userId = c.req.query("userId");
  const limit = c.req.query("limit");
  
  if (!userId) {
    return c.json({ error: "userId is required" }, 400);
  }
  
  const bills = await storage.getUpcomingBills(userId, limit ? parseInt(limit) : undefined);
  return c.json(bills);
});

app.get("/api/bills/:id", async (c) => {
  const id = c.req.param("id");
  const bill = await storage.getBill(id);
  
  if (!bill) {
    return c.json({ error: "Bill not found" }, 404);
  }
  
  return c.json(bill);
});

app.post("/api/bills", async (c) => {
  try {
    const body = await c.req.json();
    const billData = insertBillSchema.parse(body);
    const bill = await storage.createBill(billData);
    return c.json(bill, 201);
  } catch (error) {
    return c.json({ error: "Invalid bill data" }, 400);
  }
});

app.put("/api/bills/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const body = await c.req.json();
    const updates = insertBillSchema.partial().parse(body);
    const bill = await storage.updateBill(id, updates);
    
    if (!bill) {
      return c.json({ error: "Bill not found" }, 404);
    }
    
    return c.json(bill);
  } catch (error) {
    return c.json({ error: "Invalid bill data" }, 400);
  }
});

app.delete("/api/bills/:id", async (c) => {
  const id = c.req.param("id");
  const deleted = await storage.deleteBill(id);
  
  if (!deleted) {
    return c.json({ error: "Bill not found" }, 404);
  }
  
  return c.json({ success: true });
});

export default app;