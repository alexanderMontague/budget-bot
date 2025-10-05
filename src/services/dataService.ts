import type { StorageRepository } from "../types/storage";
import { LocalStorageRepository } from "../storage/localStorage";
import type { Category, Budget, Transaction } from "../types";
import { generateId } from "../util";

class DataService {
  private repository: StorageRepository;

  constructor(repository?: StorageRepository) {
    this.repository = repository || new LocalStorageRepository();
  }

  // Allow swapping storage implementations
  setRepository(repository: StorageRepository) {
    this.repository = repository;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.repository.getCategories();
  }

  async createCategory(categoryData: Omit<Category, "id">): Promise<Category> {
    const category: Category = {
      ...categoryData,
      id: generateId(),
    };
    return this.repository.saveCategory(category);
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

  // Budgets
  async getBudgets(): Promise<Budget[]> {
    return this.repository.getBudgets();
  }

  async createBudget(budgetData: Omit<Budget, "id">): Promise<Budget> {
    const budget: Budget = {
      ...budgetData,
      id: generateId(),
    };
    return this.repository.saveBudget(budget);
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
    const transactions = transactionData.map(data => ({
      ...data,
      id: generateId(),
    }));
    return this.repository.saveTransactions(transactions);
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
export const dataService = new DataService();
export default DataService;
