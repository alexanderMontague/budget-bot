import type { Category, Budget } from "./index";

export interface StorageRepository {
  // Categories
  getCategories(): Promise<Category[]>;
  saveCategory(category: Category): Promise<Category>;
  updateCategory(id: string, category: Partial<Category>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  deleteAllCategories(): Promise<void>;

  // Budgets
  getBudgets(): Promise<Budget[]>;
  saveBudget(budget: Budget): Promise<Budget>;
  updateBudget(id: string, budget: Partial<Budget>): Promise<Budget>;
  deleteBudget(id: string): Promise<void>;
  deleteAllBudgets(): Promise<void>;

  // Utility
  clearAllData(): Promise<void>;
  exportData(): Promise<string>;
  importData(data: string): Promise<void>;
}

export interface StorageConfig {
  storageKey?: string;
  autoSave?: boolean;
}
