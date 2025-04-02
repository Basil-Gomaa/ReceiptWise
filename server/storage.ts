import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  receipts, type Receipt, type InsertReceipt,
  expenseItems, type ExpenseItem, type InsertExpenseItem,
  savingsChallenges, type SavingsChallenge, type InsertSavingsChallenge
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
  
  // Savings Challenges
  getAllSavingsChallenges(): Promise<SavingsChallenge[]>;
  getSavingsChallenge(id: number): Promise<SavingsChallenge | undefined>;
  createSavingsChallenge(challenge: InsertSavingsChallenge): Promise<SavingsChallenge>;
  updateSavingsChallenge(id: number, challenge: Partial<InsertSavingsChallenge>): Promise<SavingsChallenge | undefined>;
  deleteSavingsChallenge(id: number): Promise<boolean>;
  getActiveSavingsChallenges(): Promise<SavingsChallenge[]>;
  updateChallengeProgress(id: number, amount: number): Promise<SavingsChallenge | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private receipts: Map<number, Receipt>;
  private expenseItems: Map<number, ExpenseItem>;
  private savingsChallenges: Map<number, SavingsChallenge>;
  private userId: number;
  private categoryId: number;
  private receiptId: number;
  private expenseItemId: number;
  private savingsChallengeId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.receipts = new Map();
    this.expenseItems = new Map();
    this.savingsChallenges = new Map();
    this.userId = 1;
    this.categoryId = 1;
    this.receiptId = 1;
    this.expenseItemId = 1;
    this.savingsChallengeId = 1;
    
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
    
    // Create some default savings challenges
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    
    const defaultChallenges: InsertSavingsChallenge[] = [
      {
        name: 'Coffee Budget Challenge',
        description: 'Cut your coffee spending by 30% this week',
        targetAmount: '20',
        currentAmount: '0',
        startDate: today,
        endDate: nextWeek,
        status: 'active',
        type: 'weekly',
        category: 'Food & Dining',
        difficulty: 'easy',
        icon: 'coffee',
        colorScheme: '#3B82F6',
        milestones: [
          { amount: 5, reached: false, reward: '🌟 Achievement Unlocked: Coffee Cutback' },
          { amount: 10, reached: false, reward: '🏆 Halfway There! Keep Going!' },
          { amount: 20, reached: false, reward: '🎉 Challenge Complete! You saved $20 on coffee!' }
        ]
      },
      {
        name: 'No Dining Out',
        description: 'Cook all meals at home for the next week',
        targetAmount: '50',
        currentAmount: '0',
        startDate: today,
        endDate: nextWeek,
        status: 'active',
        type: 'weekly',
        category: 'Food & Dining',
        difficulty: 'medium',
        icon: 'utensils',
        colorScheme: '#10B981',
        milestones: [
          { amount: 15, reached: false, reward: '🌟 Achievement Unlocked: Home Chef' },
          { amount: 30, reached: false, reward: '🏆 Making Progress! Keep Cooking!' },
          { amount: 50, reached: false, reward: '🎉 Challenge Complete! You saved $50 on dining out!' }
        ]
      },
      {
        name: 'Shopping Freeze Challenge',
        description: 'Avoid impulse purchases for the month',
        targetAmount: '100',
        currentAmount: '0',
        startDate: today,
        endDate: nextMonth,
        status: 'active',
        type: 'monthly',
        category: 'Shopping',
        difficulty: 'hard',
        icon: 'shopping-bag',
        colorScheme: '#EC4899',
        milestones: [
          { amount: 25, reached: false, reward: '🌟 Achievement Unlocked: Impulse Control' },
          { amount: 50, reached: false, reward: '🏆 Halfway! Your wallet thanks you!' },
          { amount: 75, reached: false, reward: '🎖️ Nearly there! Stay strong!' },
          { amount: 100, reached: false, reward: '🎉 Challenge Complete! You saved $100 on impulse buys!' }
        ]
      }
    ];
    
    for (const challenge of defaultChallenges) {
      this.createSavingsChallenge(challenge);
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
  
  // Savings Challenge methods
  async getAllSavingsChallenges(): Promise<SavingsChallenge[]> {
    return Array.from(this.savingsChallenges.values());
  }
  
  async getSavingsChallenge(id: number): Promise<SavingsChallenge | undefined> {
    return this.savingsChallenges.get(id);
  }
  
  async createSavingsChallenge(insertChallenge: InsertSavingsChallenge): Promise<SavingsChallenge> {
    const id = this.savingsChallengeId++;
    const challenge: SavingsChallenge = {
      ...insertChallenge,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.savingsChallenges.set(id, challenge);
    return challenge;
  }
  
  async updateSavingsChallenge(id: number, challengeData: Partial<InsertSavingsChallenge>): Promise<SavingsChallenge | undefined> {
    const challenge = this.savingsChallenges.get(id);
    if (!challenge) return undefined;
    
    const updatedChallenge = { 
      ...challenge, 
      ...challengeData,
      updatedAt: new Date()
    };
    this.savingsChallenges.set(id, updatedChallenge);
    return updatedChallenge;
  }
  
  async deleteSavingsChallenge(id: number): Promise<boolean> {
    return this.savingsChallenges.delete(id);
  }
  
  async getActiveSavingsChallenges(): Promise<SavingsChallenge[]> {
    return Array.from(this.savingsChallenges.values())
      .filter(challenge => challenge.status === 'active');
  }
  
  async updateChallengeProgress(id: number, amount: number): Promise<SavingsChallenge | undefined> {
    const challenge = this.savingsChallenges.get(id);
    if (!challenge) return undefined;
    
    // Update the current amount
    const currentAmount = Number(challenge.currentAmount) + amount;
    
    // Check if any milestones need to be updated
    const updatedMilestones = challenge.milestones?.map(milestone => {
      if (!milestone.reached && currentAmount >= milestone.amount) {
        return { ...milestone, reached: true };
      }
      return milestone;
    }) || [];
    
    // Check if challenge is completed
    const status = 
      currentAmount >= Number(challenge.targetAmount) 
        ? 'completed' 
        : challenge.status;
    
    const updatedChallenge = { 
      ...challenge, 
      currentAmount: currentAmount.toString(),
      milestones: updatedMilestones,
      status,
      updatedAt: new Date()
    };
    
    this.savingsChallenges.set(id, updatedChallenge);
    return updatedChallenge;
  }
}

export const storage = new MemStorage();
