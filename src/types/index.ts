export interface Category {
  id: string;
  name: string;
  monthlyBudget?: number;
  color?: string;
}

export interface Budget {
  id: string;
  month: string; // YYYY-MM format
  allocations: Record<string, number>; // categoryId -> budgetedAmount
  availableToBudget: number;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD format
  merchant: string;
  amount: number; // Negative for expenses, positive for income
  categoryId?: string;
  description?: string;
  accountType: string; // e.g., "amex", "cibc", "td", "rbc", "manual"
  accountId?: string;
  originalDescription: string; // Raw description from statement
  isTransfer?: boolean; // For credit card payments, etc.
  duplicateOf?: string; // ID of transaction this might duplicate
  confidence?: number; // AI confidence in categorization (0-1)
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: "checking" | "credit" | "savings";
  institution: string; // e.g., "amex", "cibc", "td", "rbc", "bmo", "scotiabank"
  lastFour?: string;
}

export interface CategoryProgress {
  category: Category;
  budgeted: number;
  spent: number;
  remaining: number;
  isOverspent: boolean;
}

export interface MonthlyReport {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  categoryBreakdown: CategoryProgress[];
  savingsRate: number;
}

export interface ParsedTransaction {
  date: string;
  merchant: string;
  amount: number;
  description: string;
  accountType: string;
  confidence: number;
}

export interface DeduplicationResult {
  isLikelyDuplicate: boolean;
  duplicateOf?: string;
  confidence: number;
  reason?: string;
}
