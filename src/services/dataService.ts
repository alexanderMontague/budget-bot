import type { StorageRepository } from "../types/storage";
import { LocalStorageRepository } from "../storage/localStorage";
import { DatabaseRepository } from "../storage/databaseRepository";
import type { Category, Budget, Transaction } from "../types";
import { generateId } from "../util";

class DataService {
  private repository: StorageRepository;
  private useLocalStorage: boolean;

  constructor(repository?: StorageRepository, useLocalStorage?: boolean) {
    this.repository = repository || new LocalStorageRepository();
    this.useLocalStorage = useLocalStorage ?? true;
  }

  // Allow swapping storage implementations
  setRepository(repository: StorageRepository, useLocalStorage?: boolean) {
    this.repository = repository;
    this.useLocalStorage = useLocalStorage ?? this.useLocalStorage;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.repository.getCategories();
  }

  async createCategory(categoryData: Omit<Category, "id">): Promise<Category> {
    if (this.useLocalStorage) {
      const category: Category = {
        ...categoryData,
        id: generateId(),
      };
      return this.repository.saveCategory(category);
    }
    return this.repository.saveCategory(categoryData);
  }

  async updateCategory(
    id: string,
    updates: Partial<Category>
  ): Promise<Category> {
    return this.repository.updateCategory(id, updates);
  }

  async deleteCategory(id: string): Promise<void> {
    return this.repository.deleteCategory(id);
  }

  async deleteAllCategories(): Promise<void> {
    return this.repository.deleteAllCategories();
  }

  async createDefaultCategories(): Promise<Category[]> {
    return this.repository.createDefaultCategories();
  }

  // Budgets
  async getBudgets(): Promise<Budget[]> {
    return this.repository.getBudgets();
  }

  async createBudget(budgetData: Omit<Budget, "id">): Promise<Budget> {
    if (this.useLocalStorage) {
      const budget: Budget = {
        ...budgetData,
        id: generateId(),
      };
      return this.repository.saveBudget(budget);
    }
    return this.repository.saveBudget(budgetData);
  }

  async updateBudget(id: string, updates: Partial<Budget>): Promise<Budget> {
    return this.repository.updateBudget(id, updates);
  }

  async deleteBudget(id: string): Promise<void> {
    return this.repository.deleteBudget(id);
  }

  async deleteAllBudgets(): Promise<void> {
    return this.repository.deleteAllBudgets();
  }

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    return this.repository.getTransactions();
  }

  async createTransactions(
    transactionData: Omit<Transaction, "id">[]
  ): Promise<Transaction[]> {
    if (this.useLocalStorage) {
      const transactions = transactionData.map(data => ({
        ...data,
        id: generateId(),
      }));
      return this.repository.saveTransactions(transactions);
    }
    return this.repository.saveTransactions(transactionData);
  }

  async updateTransaction(
    id: string,
    updates: Partial<Transaction>
  ): Promise<Transaction> {
    return this.repository.updateTransaction(id, updates);
  }

  async deleteTransaction(id: string): Promise<void> {
    return this.repository.deleteTransaction(id);
  }

  async deleteAllTransactions(): Promise<void> {
    return this.repository.deleteAllTransactions();
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    return this.repository.clearAllData();
  }

  async exportData(): Promise<string> {
    return this.repository.exportData();
  }

  async importData(data: string): Promise<void> {
    return this.repository.importData(data);
  }
}

// Create and export a singleton instance
const USE_LOCAL_STORAGE = import.meta.env.VITE_USE_LOCAL_STORAGE === "1";
export const dataService = new DataService(
  USE_LOCAL_STORAGE
    ? new LocalStorageRepository()
    : new DatabaseRepository({ apiBaseUrl: "http://localhost:8088" }),
  USE_LOCAL_STORAGE
);
export default DataService;
