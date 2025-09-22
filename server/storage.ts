import { User, NewUser, Category, NewCategory, Bill, NewBill } from "../shared/schema";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(user: NewUser): Promise<User>;
  
  // Category operations
  getCategories(userId: string): Promise<Category[]>;
  getCategory(id: string): Promise<Category | null>;
  createCategory(category: NewCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<NewCategory>): Promise<Category | null>;
  deleteCategory(id: string): Promise<boolean>;
  
  // Bill operations
  getBills(userId: string): Promise<Bill[]>;
  getBill(id: string): Promise<Bill | null>;
  createBill(bill: NewBill): Promise<Bill>;
  updateBill(id: string, bill: Partial<NewBill>): Promise<Bill | null>;
  deleteBill(id: string): Promise<boolean>;
  getUpcomingBills(userId: string, limit?: number): Promise<Bill[]>;
  clearAllData(): Promise<{ success: boolean; message: string }>;
}

export class MemStorage implements IStorage {
  private users: User[] = [];
  private categories: Category[] = [];
  private bills: Bill[] = [];

  // User operations
  async getUser(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.find(u => u.email === email) || null;
  }

  async createUser(userData: NewUser): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      ...userData,
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  // Category operations
  async getCategories(userId: string): Promise<Category[]> {
    return this.categories.filter(c => c.userId === userId);
  }

  async getCategory(id: string): Promise<Category | null> {
    return this.categories.find(c => c.id === id) || null;
  }

  async createCategory(categoryData: NewCategory): Promise<Category> {
    const category: Category = {
      id: crypto.randomUUID(),
      ...categoryData,
      color: categoryData.color ?? null,
      icon: categoryData.icon ?? null,
    };
    this.categories.push(category);
    return category;
  }

  async updateCategory(id: string, updates: Partial<NewCategory>): Promise<Category | null> {
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    this.categories[index] = { ...this.categories[index], ...updates };
    return this.categories[index];
  }

  async deleteCategory(id: string): Promise<boolean> {
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) return false;
    
    this.categories.splice(index, 1);
    return true;
  }

  // Bill operations
  async getBills(userId: string): Promise<Bill[]> {
    return this.bills.filter(b => b.userId === userId);
  }

  async getBill(id: string): Promise<Bill | null> {
    return this.bills.find(b => b.id === id) || null;
  }

  async createBill(billData: NewBill): Promise<Bill> {
    const bill: Bill = {
      id: crypto.randomUUID(),
      ...billData,
      isPaid: billData.isPaid ?? null,
      description: billData.description ?? null,
      categoryId: billData.categoryId ?? null,
      createdAt: new Date(),
    };
    this.bills.push(bill);
    return bill;
  }

  async updateBill(id: string, updates: Partial<NewBill>): Promise<Bill | null> {
    const index = this.bills.findIndex(b => b.id === id);
    if (index === -1) return null;
    
    this.bills[index] = { ...this.bills[index], ...updates };
    return this.bills[index];
  }

  async deleteBill(id: string): Promise<boolean> {
    const index = this.bills.findIndex(b => b.id === id);
    if (index === -1) return false;
    
    this.bills.splice(index, 1);
    return true;
  }

  async getUpcomingBills(userId: string, limit = 10): Promise<Bill[]> {
    const now = new Date();
    return this.bills
      .filter(b => b.userId === userId && !b.isPaid && b.dueDate > now)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, limit);
  }

  // Clear all data
  async clearAllData(): Promise<{ success: boolean; message: string }> {
    this.users = [];
    this.categories = [];
    this.bills = [];
    return { success: true, message: "Todos os dados foram excluídos com sucesso" };
  }
}

export const storage = new MemStorage();