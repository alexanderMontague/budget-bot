import type { StorageRepository, StorageConfig } from "../types/storage";
import type { Category, Budget, Transaction } from "../types";

// Example of how to implement a database repository
// This would connect to your database of choice (PostgreSQL, MongoDB, etc.)

export class DatabaseRepository implements StorageRepository {
  private apiBaseUrl: string;

  constructor(config: StorageConfig & { apiBaseUrl: string }) {
    this.apiBaseUrl = config.apiBaseUrl;
  }

  // Example implementation - replace with actual database calls

  // Categories
  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${this.apiBaseUrl}/categories`);
    if (!response.ok) throw new Error("Failed to fetch categories");
    return response.json();
  }

  async saveCategory(category: Category): Promise<Category> {
    const response = await fetch(`${this.apiBaseUrl}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(category),
    });
    if (!response.ok) throw new Error("Failed to save category");
    return response.json();
  }

  async updateCategory(
    id: string,
    category: Partial<Category>
  ): Promise<Category> {
    const response = await fetch(`${this.apiBaseUrl}/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(category),
    });
    if (!response.ok) throw new Error("Failed to update category");
    return response.json();
  }

  async deleteCategory(id: string): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/categories/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete category");
  }

  // Budgets
  async getBudgets(): Promise<Budget[]> {
    const response = await fetch(`${this.apiBaseUrl}/budgets`);
    if (!response.ok) throw new Error("Failed to fetch budgets");
    return response.json();
  }

  async saveBudget(budget: Budget): Promise<Budget> {
    const response = await fetch(`${this.apiBaseUrl}/budgets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(budget),
    });
    if (!response.ok) throw new Error("Failed to save budget");
    return response.json();
  }

  async updateBudget(id: string, budget: Partial<Budget>): Promise<Budget> {
    const response = await fetch(`${this.apiBaseUrl}/budgets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(budget),
    });
    if (!response.ok) throw new Error("Failed to update budget");
    return response.json();
  }

  async deleteBudget(id: string): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/budgets/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete budget");
  }

  async deleteAllBudgets(): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/budgets`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete all budgets");
  }

  async deleteAllCategories(): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/categories`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete all categories");
  }

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    const response = await fetch(`${this.apiBaseUrl}/transactions`);
    if (!response.ok) throw new Error("Failed to fetch transactions");
    return response.json();
  }

  async saveTransactions(transaction: Transaction[]): Promise<Transaction[]> {
    const response = await fetch(`${this.apiBaseUrl}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transaction),
    });
    if (!response.ok) throw new Error("Failed to save transaction");
    return response.json();
  }

  async updateTransaction(
    id: string,
    updates: Partial<Transaction>
  ): Promise<Transaction> {
    const response = await fetch(`${this.apiBaseUrl}/transactions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error("Failed to update transaction");
    return response.json();
  }

  async deleteTransaction(id: string): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/transactions/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete transaction");
  }

  async deleteAllTransactions(): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/transactions`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete all transactions");
  }

  // Utility
  async clearAllData(): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/clear`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to clear data");
  }

  async exportData(): Promise<string> {
    const response = await fetch(`${this.apiBaseUrl}/export`);
    if (!response.ok) throw new Error("Failed to export data");
    return response.text();
  }

  async importData(data: string): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: data,
    });
    if (!response.ok) throw new Error("Failed to import data");
  }
}

/*
Example usage:

// To switch from localStorage to database:
import { DatabaseRepository } from './storage/databaseRepository';
import { dataService } from './services/dataService';

const dbRepository = new DatabaseRepository({
  apiBaseUrl: 'https://your-api.com/api'
});
dataService.setRepository(dbRepository);
*/
