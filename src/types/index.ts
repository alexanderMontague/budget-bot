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
