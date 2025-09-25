import type { StorageRepository, StorageConfig } from "../types/storage";
import type { Category, Budget } from "../types";

const DEFAULT_STORAGE_KEY = "budget-bot-data";

interface StorageData {
  categories: Category[];
  budgets: Budget[];
  lastUpdated: string;
}

export class LocalStorageRepository implements StorageRepository {
  private storageKey: string;

  constructor(config: StorageConfig = {}) {
    this.storageKey = config.storageKey || DEFAULT_STORAGE_KEY;
  }

  private async loadData(): Promise<StorageData> {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) {
        return this.getEmptyData();
      }
      return JSON.parse(data);
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      return this.getEmptyData();
    }
  }

  private async saveData(data: StorageData): Promise<void> {
    try {
      data.lastUpdated = new Date().toISOString();
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving data to localStorage:", error);
      throw new Error("Failed to save data");
    }
  }

  private getEmptyData(): StorageData {
    return {
      categories: [],
      budgets: [],
      lastUpdated: new Date().toISOString(),
    };
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const data = await this.loadData();
    return data.categories;
  }

  async saveCategory(category: Category): Promise<Category> {
    const data = await this.loadData();
    const existingIndex = data.categories.findIndex(c => c.id === category.id);

    if (existingIndex >= 0) {
      data.categories[existingIndex] = category;
    } else {
      data.categories.push(category);
    }

    await this.saveData(data);
    return category;
  }

  async updateCategory(
    id: string,
    updates: Partial<Category>
  ): Promise<Category> {
    const data = await this.loadData();
    const categoryIndex = data.categories.findIndex(c => c.id === id);

    if (categoryIndex === -1) {
      throw new Error(`Category with id ${id} not found`);
    }

    const updatedCategory = { ...data.categories[categoryIndex], ...updates };
    data.categories[categoryIndex] = updatedCategory;

    await this.saveData(data);
    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<void> {
    const data = await this.loadData();
    data.categories = data.categories.filter(c => c.id !== id);
    await this.saveData(data);
  }

  async deleteAllCategories(): Promise<void> {
    const data = await this.loadData();
    data.categories = [];
    await this.saveData(data);
  }

  // Budgets
  async getBudgets(): Promise<Budget[]> {
    const data = await this.loadData();
    return data.budgets;
  }

  async saveBudget(budget: Budget): Promise<Budget> {
    const data = await this.loadData();
    const existingIndex = data.budgets.findIndex(b => b.id === budget.id);

    if (existingIndex >= 0) {
      data.budgets[existingIndex] = budget;
    } else {
      data.budgets.push(budget);
    }

    await this.saveData(data);
    return budget;
  }

  async updateBudget(id: string, updates: Partial<Budget>): Promise<Budget> {
    const data = await this.loadData();
    const budgetIndex = data.budgets.findIndex(b => b.id === id);

    if (budgetIndex === -1) {
      throw new Error(`Budget with id ${id} not found`);
    }

    const updatedBudget = { ...data.budgets[budgetIndex], ...updates };
    data.budgets[budgetIndex] = updatedBudget;

    await this.saveData(data);
    return updatedBudget;
  }

  async deleteBudget(id: string): Promise<void> {
    const data = await this.loadData();
    data.budgets = data.budgets.filter(b => b.id !== id);
    await this.saveData(data);
  }

  async deleteAllBudgets(): Promise<void> {
    const data = await this.loadData();
    data.budgets = [];
    await this.saveData(data);
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    localStorage.removeItem(this.storageKey);
  }

  async exportData(): Promise<string> {
    const data = await this.loadData();
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData) as StorageData;
      await this.saveData(data);
    } catch (error) {
      console.error("Error importing data:", error);
      throw new Error("Invalid data format");
    }
  }
}
