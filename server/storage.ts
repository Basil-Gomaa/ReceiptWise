import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  receipts, type Receipt, type InsertReceipt,
  expenseItems, type ExpenseItem, type InsertExpenseItem
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Categories
  getAllCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Receipts
  getAllReceipts(): Promise<Receipt[]>;
  getReceipt(id: number): Promise<Receipt | undefined>;
  createReceipt(receipt: InsertReceipt): Promise<Receipt>;
  updateReceipt(id: number, receipt: Partial<InsertReceipt>): Promise<Receipt | undefined>;
  deleteReceipt(id: number): Promise<boolean>;
  getReceiptsByCategory(categoryId: number): Promise<Receipt[]>;
  
  // Expense Items
  getAllExpenseItems(receiptId: number): Promise<ExpenseItem[]>;
  createExpenseItem(expenseItem: InsertExpenseItem): Promise<ExpenseItem>;
  updateExpenseItem(id: number, expenseItem: Partial<InsertExpenseItem>): Promise<ExpenseItem | undefined>;
  deleteExpenseItem(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private receipts: Map<number, Receipt>;
  private expenseItems: Map<number, ExpenseItem>;
  private userId: number;
  private categoryId: number;
  private receiptId: number;
  private expenseItemId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.receipts = new Map();
    this.expenseItems = new Map();
    this.userId = 1;
    this.categoryId = 1;
    this.receiptId = 1;
    this.expenseItemId = 1;
    
    // Create default categories
    const defaultCategories: InsertCategory[] = [
      { name: 'Food & Dining', color: '#3B82F6', icon: 'food' },
      { name: 'Groceries', color: '#10B981', icon: 'shopping-bag' },
      { name: 'Transportation', color: '#F59E0B', icon: 'car' },
      { name: 'Utilities', color: '#8B5CF6', icon: 'home' },
      { name: 'Shopping', color: '#EC4899', icon: 'shopping-cart' },
      { name: 'Subscriptions', color: '#6366F1', icon: 'calendar' },
    ];
    
    for (const category of defaultCategories) {
      this.createCategory(category);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;

    const updatedCategory = { ...category, ...categoryData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Receipt methods
  async getAllReceipts(): Promise<Receipt[]> {
    return Array.from(this.receipts.values());
  }

  async getReceipt(id: number): Promise<Receipt | undefined> {
    return this.receipts.get(id);
  }

  async createReceipt(insertReceipt: InsertReceipt): Promise<Receipt> {
    const id = this.receiptId++;
    const receipt: Receipt = {
      ...insertReceipt,
      id,
      createdAt: new Date(),
    };
    this.receipts.set(id, receipt);
    return receipt;
  }

  async updateReceipt(id: number, receiptData: Partial<InsertReceipt>): Promise<Receipt | undefined> {
    const receipt = this.receipts.get(id);
    if (!receipt) return undefined;

    const updatedReceipt = { ...receipt, ...receiptData };
    this.receipts.set(id, updatedReceipt);
    return updatedReceipt;
  }

  async deleteReceipt(id: number): Promise<boolean> {
    // Also delete associated expense items
    Array.from(this.expenseItems.values())
      .filter(item => item.receiptId === id)
      .forEach(item => this.expenseItems.delete(item.id));
    
    return this.receipts.delete(id);
  }

  async getReceiptsByCategory(categoryId: number): Promise<Receipt[]> {
    return Array.from(this.receipts.values()).filter(
      receipt => receipt.categoryId === categoryId
    );
  }

  // Expense Item methods
  async getAllExpenseItems(receiptId: number): Promise<ExpenseItem[]> {
    return Array.from(this.expenseItems.values()).filter(
      item => item.receiptId === receiptId
    );
  }

  async createExpenseItem(insertExpenseItem: InsertExpenseItem): Promise<ExpenseItem> {
    const id = this.expenseItemId++;
    const expenseItem: ExpenseItem = { ...insertExpenseItem, id };
    this.expenseItems.set(id, expenseItem);
    return expenseItem;
  }

  async updateExpenseItem(id: number, expenseItemData: Partial<InsertExpenseItem>): Promise<ExpenseItem | undefined> {
    const expenseItem = this.expenseItems.get(id);
    if (!expenseItem) return undefined;

    const updatedExpenseItem = { ...expenseItem, ...expenseItemData };
    this.expenseItems.set(id, updatedExpenseItem);
    return updatedExpenseItem;
  }

  async deleteExpenseItem(id: number): Promise<boolean> {
    return this.expenseItems.delete(id);
  }
}

export const storage = new MemStorage();
