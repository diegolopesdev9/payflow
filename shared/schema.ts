
// shared/schema.ts - Types compartilhados entre frontend e backend

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: Date | string;       // camelCase
  isPaid: boolean;              // camelCase
  userId: string;               // camelCase
  categoryId?: string | null;   // camelCase
  description?: string | null;
  createdAt?: Date | string;    // camelCase
}

export type NewBill = Omit<Bill, 'id' | 'createdAt'>;

export interface CreateBillDTO {
  name: string;
  description?: string;
  amount: number;
  dueDate: string;
  categoryId: string;
  recurring?: boolean;
  recurrence?: string;
}

export interface UpdateBillDTO {
  name?: string;
  description?: string;
  amount?: number;
  dueDate?: string;
  categoryId?: string;
  isPaid?: boolean;
  paidAt?: string;
  recurring?: boolean;
  recurrence?: string;
}

export interface CreateCategoryDTO {
  name: string;
  color?: string;
  icon?: string;
}
