import type { StorageRepository } from "../types/storage";
import { LocalStorageRepository } from "../storage/localStorage";
import type { Category, Budget } from "../types";

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
      id: this.generateId(),
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

  // Budgets
  async getBudgets(): Promise<Budget[]> {
    return this.repository.getBudgets();
  }

  async createBudget(budgetData: Omit<Budget, "id">): Promise<Budget> {
    const budget: Budget = {
      ...budgetData,
      id: this.generateId(),
    };
    return this.repository.saveBudget(budget);
  }

  async updateBudget(id: string, updates: Partial<Budget>): Promise<Budget> {
    return this.repository.updateBudget(id, updates);
  }

  async deleteBudget(id: string): Promise<void> {
    return this.repository.deleteBudget(id);
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

  // Helper methods
  async getCurrentMonthBudget(): Promise<Budget | null> {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
    const budgets = await this.getBudgets();
    return budgets.find(b => b.month === currentMonth) || null;
  }

  async getBudgetForMonth(month: string): Promise<Budget | null> {
    const budgets = await this.getBudgets();
    return budgets.find(b => b.month === month) || null;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Create and export a singleton instance
export const dataService = new DataService();
export default DataService;
