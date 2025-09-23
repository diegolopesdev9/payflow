
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { users, categories, bills } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { IStorage, User, NewUser, Category, NewCategory, Bill, NewBill } from './storage';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const db = drizzle(pool);

export class PostgreSQLStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0] || null;
  }

  async createUser(userData: NewUser): Promise<User> {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  // Category operations
  async getCategories(userId: string): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.userId, userId));
  }

  async getCategory(id: string): Promise<Category | null> {
    const result = await db.select().from(categories).where(eq(categories.id, id));
    return result[0] || null;
  }

  async createCategory(categoryData: NewCategory): Promise<Category> {
    const result = await db.insert(categories).values(categoryData).returning();
    return result[0];
  }

  async updateCategory(id: string, updates: Partial<NewCategory>): Promise<Category | null> {
    const result = await db.update(categories).set(updates).where(eq(categories.id, id)).returning();
    return result[0] || null;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id)).returning();
    return result.length > 0;
  }

  // Bill operations
  async getBills(userId: string): Promise<Bill[]> {
    return await db.select().from(bills).where(eq(bills.userId, userId));
  }

  async getBill(id: string): Promise<Bill | null> {
    const result = await db.select().from(bills).where(eq(bills.id, id));
    return result[0] || null;
  }

  async createBill(billData: NewBill): Promise<Bill> {
    const result = await db.insert(bills).values(billData).returning();
    return result[0];
  }

  async updateBill(id: string, updates: Partial<NewBill>): Promise<Bill | null> {
    const result = await db.update(bills).set(updates).where(eq(bills.id, id)).returning();
    return result[0] || null;
  }

  async deleteBill(id: string): Promise<boolean> {
    const result = await db.delete(bills).where(eq(bills.id, id)).returning();
    return result.length > 0;
  }

  async getUpcomingBills(userId: string, limit = 10): Promise<Bill[]> {
    const now = new Date();
    return await db
      .select()
      .from(bills)
      .where(eq(bills.userId, userId))
      .limit(limit);
  }

  async clearAllData(): Promise<{ success: boolean; message: string }> {
    try {
      await db.delete(bills);
      await db.delete(categories);
      await db.delete(users);
      return { success: true, message: "Todos os dados foram excluídos com sucesso" };
    } catch (error) {
      return { success: false, message: "Erro ao excluir dados" };
    }
  }
}

export const postgresStorage = new PostgreSQLStorage();
