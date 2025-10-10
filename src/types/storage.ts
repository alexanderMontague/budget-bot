import type { Category, Budget, Transaction } from "./index";

export interface StorageRepository {
  // Categories
  getCategories(): Promise<Category[]>;
  saveCategory(category: Partial<Category>): Promise<Category>;
  updateCategory(id: string, category: Partial<Category>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  deleteAllCategories(): Promise<void>;

  // Budgets
  getBudgets(): Promise<Budget[]>;
  saveBudget(budget: Partial<Budget>): Promise<Budget>;
  updateBudget(id: string, budget: Partial<Budget>): Promise<Budget>;
  deleteBudget(id: string): Promise<void>;
  deleteAllBudgets(): Promise<void>;

  // Transactions
  getTransactions(): Promise<Transaction[]>;
  saveTransactions(
    transactions: Partial<Transaction>[]
  ): Promise<Transaction[]>;
  updateTransaction(
    id: string,
    transaction: Partial<Transaction>
  ): Promise<Transaction>;
  deleteTransaction(id: string): Promise<void>;
  deleteAllTransactions(): Promise<void>;

  // Utility
  clearAllData(): Promise<void>;
  exportData(): Promise<string>;
  importData(data: string): Promise<void>;
}

export interface StorageConfig {
  storageKey?: string;
  autoSave?: boolean;
}
