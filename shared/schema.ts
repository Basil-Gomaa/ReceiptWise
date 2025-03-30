import { pgTable, text, serial, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  icon: text("icon"),
});

export const receipts = pgTable("receipts", {
  id: serial("id").primaryKey(),
  merchantName: text("merchant_name").notNull(),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  imageUrl: text("image_url"),
  categoryId: integer("category_id"),
  userId: integer("user_id"),
  ocrText: text("ocr_text"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const expenseItems = pgTable("expense_items", {
  id: serial("id").primaryKey(),
  receiptId: integer("receipt_id").notNull(),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).default("1"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  color: true,
  icon: true,
});

export const insertReceiptSchema = createInsertSchema(receipts).pick({
  merchantName: true,
  total: true,
  date: true,
  imageUrl: true,
  categoryId: true,
  userId: true,
  ocrText: true,
});

export const insertExpenseItemSchema = createInsertSchema(expenseItems).pick({
  receiptId: true,
  description: true,
  amount: true,
  quantity: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertReceipt = z.infer<typeof insertReceiptSchema>;
export type InsertExpenseItem = z.infer<typeof insertExpenseItemSchema>;

export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Receipt = typeof receipts.$inferSelect;
export type ExpenseItem = typeof expenseItems.$inferSelect;
