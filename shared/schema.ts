
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
  due_date: Date | string;      // snake_case
  is_paid: boolean;             // snake_case
  user_id: string;              // snake_case
  category_id?: string | null;  // snake_case
  description?: string | null;
  created_at?: Date | string;   // snake_case
}

export type NewBill = Omit<Bill, 'id' | 'created_at'>;

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
