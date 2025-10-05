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

export interface Transaction extends ParsedTransaction {
  id: string;
  budgetId: string; // associated budget
  categoryId?: string;
  transactionHash: string; // used to deduplicate transactions
  createdAt: string;
  updatedAt: string;
}

export interface ParsedTransaction {
  date: string; // YYYY-MM-DD format
  merchant: string;
  amount: number;
  description: string;
  accountType: string; // e.g., "amex", "cibc", "td", "rbc", "manual"
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

export interface DeduplicationResult {
  isLikelyDuplicate: boolean;
  duplicateOf?: string;
  confidence: number;
  reason?: string;
}
