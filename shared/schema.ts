import { pgTable, text, integer, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Categories table
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  color: text("color").default("#3b82f6"),
  icon: text("icon").default("CreditCard"),
  userId: uuid("user_id").references(() => users.id).notNull(),
});

// Bills table
export const bills = pgTable("bills", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  amount: integer("amount").notNull(), // Store as cents
  dueDate: timestamp("due_date").notNull(),
  isPaid: boolean("is_paid").default(false),
  description: text("description"),
  categoryId: uuid("category_id").references(() => categories.id),
  userId: uuid("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertBillSchema = createInsertSchema(bills).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = z.infer<typeof insertUserSchema>;
export type Category = typeof categories.$inferSelect;
export type NewCategory = z.infer<typeof insertCategorySchema>;
export type Bill = typeof bills.$inferSelect;
export type NewBill = z.infer<typeof insertBillSchema>;