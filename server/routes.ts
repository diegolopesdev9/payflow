import { Hono } from "hono";
import { z } from "zod";
import { storage } from "./storage";
import { insertUserSchema, insertCategorySchema, insertBillSchema } from "../shared/schema";
import { 
  registerSchema, 
  loginSchema, 
  verifyPassword, 
  generateToken,
  loginAttempts 
} from "./auth";
import { 
  authMiddleware, 
  rateLimitMiddleware, 
  apiRateLimit, 
  authRateLimit 
} from "./middleware";
import { ContextVariables } from "./types";
import { requireUser } from "./supabaseAuth";

const app = new Hono<{ Variables: ContextVariables }>();

// Rota pública de saúde
app.get("/api/healthz", (c) => c.json({ ok: true, time: new Date().toISOString() }));

// Aplicar rate limiting global para todas as rotas API
app.use('/api/*', rateLimitMiddleware(apiRateLimit));

// Rate limiting específico para rotas de autenticação
app.use('/api/auth/*', rateLimitMiddleware(authRateLimit));

// Auth routes
app.post("/api/auth/register", async (c) => {
  try {
    const body = await c.req.json();
    const userData = registerSchema.parse(body);

    // Verificar se email já existe
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      return c.json({ error: "Email já está em uso" }, 409);
    }

    // Criar usuário com senha hasheada
    const user = await storage.createUser({
      name: userData.name,
      email: userData.email,
      passwordHash: userData.password // Será hasheada no storage
    });

    // Gerar token JWT
    const token = generateToken(user.id);

    // Retornar dados sem a senha
    const { passwordHash, ...userWithoutPassword } = user;

    return c.json({ 
      user: userWithoutPassword, 
      token,
      message: "Conta criada com sucesso!"
    }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Verificar se há erro de senha para mostrar mensagem mais específica
      const passwordError = error.errors.find(e => e.path.includes('password'));
      if (passwordError) {
        return c.json({ 
          error: "A senha deve conter pelo menos 8 caracteres, incluindo: letras maiúsculas, minúsculas, números e caracteres especiais (@$!%*?&)" 
        }, 400);
      }
      return c.json({ 
        error: "Dados inválidos", 
        details: error.errors.map(e => e.message) 
      }, 400);
    }
    return c.json({ error: "Erro interno do servidor" }, 500);
  }
});

app.post("/api/auth/login", async (c) => {
  try {
    const body = await c.req.json();
    const loginData = loginSchema.parse(body);

    // Verificar rate limiting
    if (loginAttempts.isBlocked(loginData.email)) {
      const remainingTime = Math.ceil(loginAttempts.getRemainingTime(loginData.email) / 1000 / 60);
      return c.json({ 
        error: `Muitas tentativas de login. Tente novamente em ${remainingTime} minutos.` 
      }, 429);
    }

    // Buscar usuário por email
    const user = await storage.getUserByEmail(loginData.email);
    if (!user) {
      loginAttempts.recordAttempt(loginData.email, false);
      return c.json({ error: "Email ou senha incorretos" }, 401);
    }

    // Verificar senha
    const isValidPassword = await verifyPassword(loginData.password, user.passwordHash);
    if (!isValidPassword) {
      loginAttempts.recordAttempt(loginData.email, false);
      return c.json({ error: "Email ou senha incorretos" }, 401);
    }

    // Login bem-sucedido
    loginAttempts.recordAttempt(loginData.email, true);

    // Gerar token JWT
    const token = generateToken(user.id);

    // Retornar dados sem a senha
    const { passwordHash, ...userWithoutPassword } = user;

    return c.json({ 
      user: userWithoutPassword, 
      token,
      message: "Login realizado com sucesso!"
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ 
        error: "Dados inválidos", 
        details: error.errors.map(e => e.message) 
      }, 400);
    }
    return c.json({ error: "Erro interno do servidor" }, 500);
  }
});

// User routes (protegidas)
app.post("/api/users", async (c) => {
  // Redirecionar para rota de registro
  return c.json({ error: "Use /api/auth/register para criar conta" }, 400);
});

app.get("/api/users/:id", authMiddleware, async (c) => {
  const userId = c.get('userId');
  const id = c.req.param("id");

  // Usuários só podem acessar seus próprios dados
  if (userId !== id) {
    return c.json({ error: "Acesso negado" }, 403);
  }

  const user = await storage.getUser(id);
  if (!user) {
    return c.json({ error: "Usuário não encontrado" }, 404);
  }

  // Remover senha do retorno
  const { passwordHash, ...userWithoutPassword } = user;
  return c.json(userWithoutPassword);
});

// Category routes
app.get("/api/categories", authMiddleware, async (c) => {
  const userId = c.get('userId');
  const categories = await storage.getCategories(userId);
  return c.json(categories);
});

app.post("/api/categories", authMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const categoryData = insertCategorySchema.parse(body);
    const category = await storage.createCategory(categoryData);
    return c.json(category, 201);
  } catch (error) {
    return c.json({ error: "Invalid category data" }, 400);
  }
});

app.put("/api/categories/:id", authMiddleware, async (c) => {
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

app.delete("/api/categories/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const deleted = await storage.deleteCategory(id);

  if (!deleted) {
    return c.json({ error: "Category not found" }, 404);
  }

  return c.json({ success: true });
});

// Bill routes
app.get("/api/bills", authMiddleware, async (c) => {
  const userId = c.get('userId');
  const bills = await storage.getBills(userId);
  return c.json(bills);
});

app.get("/api/bills/upcoming", authMiddleware, async (c) => {
  const userId = c.get('userId');
  const limit = c.req.query("limit");
  const bills = await storage.getUpcomingBills(userId, limit ? parseInt(limit) : undefined);
  return c.json(bills);
});

app.get("/api/bills/:id", authMiddleware, async (c) => {
  const userId = c.get('userId');
  const id = c.req.param("id");
  const bill = await storage.getBill(id);

  if (!bill) {
    return c.json({ error: "Bill not found" }, 404);
  }

  // Verificar se a conta pertence ao usuário autenticado
  if (bill.userId !== userId) {
    return c.json({ error: "Acesso negado" }, 403);
  }

  return c.json(bill);
});

app.post("/api/bills", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const billData = insertBillSchema.parse({ ...body, userId });
    const bill = await storage.createBill(billData);
    return c.json(bill, 201);
  } catch (error) {
    return c.json({ error: "Invalid bill data" }, 400);
  }
});

app.put("/api/bills/:id", authMiddleware, async (c) => {
  const userId = c.get('userId');
  const id = c.req.param("id");

  // Verificar se a conta existe e pertence ao usuário
  const existingBill = await storage.getBill(id);
  if (!existingBill) {
    return c.json({ error: "Bill not found" }, 404);
  }

  if (existingBill.userId !== userId) {
    return c.json({ error: "Acesso negado" }, 403);
  }

  try {
    const body = await c.req.json();
    const updates = insertBillSchema.partial().parse(body);
    const bill = await storage.updateBill(id, updates);
    return c.json(bill);
  } catch (error) {
    return c.json({ error: "Invalid bill data" }, 400);
  }
});

app.delete("/api/bills/:id", authMiddleware, async (c) => {
  const userId = c.get('userId');
  const id = c.req.param("id");

  // Verificar se a conta existe e pertence ao usuário
  const existingBill = await storage.getBill(id);
  if (!existingBill) {
    return c.json({ error: "Bill not found" }, 404);
  }

  if (existingBill.userId !== userId) {
    return c.json({ error: "Acesso negado" }, 403);
  }

  const deleted = await storage.deleteBill(id);
  return c.json({ success: true });
});

// Clear all data endpoint
app.delete("/api/clear-all-data", async (c) => {
  try {
    const result = await storage.clearAllData();
    return c.json(result);
  } catch (error) {
    return c.json({ error: "Erro ao limpar dados" }, 500);
  }
});

// Rota para obter dados do usuário autenticado via Supabase
app.get("/api/users/me", requireUser, async (c) => {
  const user: any = c.get("user");
  return c.json({
    id: user?.id ?? null,
    email: user?.email ?? null,
    name: user?.user_metadata?.name ?? null,
  });
});

// Export the app
export default app;