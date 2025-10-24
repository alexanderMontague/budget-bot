import type { StorageRepository, StorageConfig } from "../types/storage";
import type { Category, Budget, Transaction } from "../types";

export class DatabaseRepository implements StorageRepository {
  private apiBaseUrl: string;

  constructor(config: StorageConfig & { apiBaseUrl: string }) {
    this.apiBaseUrl = config.apiBaseUrl;
  }

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem("auth_token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse(response: Response): Promise<void> {
    if (response.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${this.apiBaseUrl}/budget/categories`, {
      headers: this.getHeaders(),
    });
    await this.handleResponse(response);
    if (!response.ok) throw new Error("Failed to fetch categories");
    return response.json();
  }

  async saveCategory(category: Partial<Category>): Promise<Category> {
    const response = await fetch(`${this.apiBaseUrl}/budget/categories`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(category),
    });
    await this.handleResponse(response);
    if (!response.ok) throw new Error("Failed to save category");
    return response.json();
  }

  async updateCategory(
    id: string,
    category: Partial<Category>
  ): Promise<Category> {
    const response = await fetch(`${this.apiBaseUrl}/budget/categories/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(category),
    });
    await this.handleResponse(response);
    if (!response.ok) throw new Error("Failed to update category");
    return response.json();
  }

  async deleteCategory(id: string): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/budget/categories/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    await this.handleResponse(response);
    if (!response.ok) throw new Error("Failed to delete category");
  }

  // Budgets
  async getBudgets(): Promise<Budget[]> {
    const response = await fetch(`${this.apiBaseUrl}/budget/budgets`, {
      headers: this.getHeaders(),
    });
    await this.handleResponse(response);
    if (!response.ok) throw new Error("Failed to fetch budgets");
    return response.json();
  }

  async saveBudget(budget: Partial<Budget>): Promise<Budget> {
    const response = await fetch(`${this.apiBaseUrl}/budget/budgets`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(budget),
    });
    await this.handleResponse(response);
    if (!response.ok) throw new Error("Failed to save budget");
    return response.json();
  }

  async updateBudget(id: string, budget: Partial<Budget>): Promise<Budget> {
    const response = await fetch(`${this.apiBaseUrl}/budget/budgets/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(budget),
    });
    await this.handleResponse(response);
    if (!response.ok) throw new Error("Failed to update budget");
    return response.json();
  }

  async deleteBudget(id: string): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/budget/budgets/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    await this.handleResponse(response);
    if (!response.ok) throw new Error("Failed to delete budget");
  }

  async deleteAllBudgets(): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/budget/budgets`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    await this.handleResponse(response);
    if (!response.ok) throw new Error("Failed to delete all budgets");
  }

  async deleteAllCategories(): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/budget/categories`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    await this.handleResponse(response);
    if (!response.ok) throw new Error("Failed to delete all categories");
  }

  async createDefaultCategories(): Promise<Category[]> {
    const response = await fetch(
      `${this.apiBaseUrl}/budget/categories/defaults`,
      {
        method: "POST",
        headers: this.getHeaders(),
      }
    );
    await this.handleResponse(response);
    if (!response.ok) throw new Error("Failed to create default categories");
    return response.json();
  }

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    const response = await fetch(`${this.apiBaseUrl}/budget/transactions`, {
      headers: this.getHeaders(),
    });
    await this.handleResponse(response);
    if (!response.ok) throw new Error("Failed to fetch transactions");
    return response.json();
  }

  async saveTransactions(
    transaction: Partial<Transaction>[]
  ): Promise<Transaction[]> {
    const response = await fetch(`${this.apiBaseUrl}/budget/transactions`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(transaction),
    });
    await this.handleResponse(response);
    if (!response.ok) throw new Error("Failed to save transaction");
    return response.json();
  }

  async updateTransaction(
    id: string,
    updates: Partial<Transaction>
  ): Promise<Transaction> {
    const response = await fetch(
      `${this.apiBaseUrl}/budget/transactions/${id}`,
      {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(updates),
      }
    );
    await this.handleResponse(response);
    if (!response.ok) throw new Error("Failed to update transaction");
    return response.json();
  }

  async deleteTransaction(id: string): Promise<void> {
    const response = await fetch(
      `${this.apiBaseUrl}/budget/transactions/${id}`,
      {
        method: "DELETE",
        headers: this.getHeaders(),
      }
    );
    await this.handleResponse(response);
    if (!response.ok) throw new Error("Failed to delete transaction");
  }

  async deleteAllTransactions(): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/budget/transactions`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    await this.handleResponse(response);
    if (!response.ok) throw new Error("Failed to delete all transactions");
  }

  // Utility
  async clearAllData(): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/budget/clear`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    await this.handleResponse(response);
    if (!response.ok) throw new Error("Failed to clear data");
  }

  async exportData(): Promise<string> {
    const response = await fetch(`${this.apiBaseUrl}/budget/export`, {
      headers: this.getHeaders(),
    });
    await this.handleResponse(response);
    if (!response.ok) throw new Error("Failed to export data");
    return response.text();
  }

  async importData(data: string): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/budget/import`, {
      method: "POST",
      headers: this.getHeaders(),
      body: data,
    });
    await this.handleResponse(response);
    if (!response.ok) throw new Error("Failed to import data");
  }
}
