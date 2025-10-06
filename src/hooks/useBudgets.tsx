import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { dataService } from "../services/dataService";
import type { Budget } from "../types";
import { useDate } from "./useDate";

interface BudgetsContextType {
  budgets: Budget[];
  loading: boolean;
  error: string | null;
  createBudget: (budgetData: Omit<Budget, "id">) => Promise<Budget>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<Budget>;
  deleteBudget: (id: string) => Promise<void>;
  deleteAllBudgets: () => Promise<void>;
  loadBudgets: () => Promise<void>;
  getCurrentBudget: () => Budget | undefined;
}

const BudgetsContext = createContext<BudgetsContextType | undefined>(undefined);

export const BudgetsProvider = ({ children }: { children: ReactNode }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentMonthAndYear } = useDate();

  const loadBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dataService.getBudgets();
      setBudgets(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load budgets");
    } finally {
      setLoading(false);
    }
  }, []);

  const createBudget = useCallback(async (budgetData: Omit<Budget, "id">) => {
    try {
      const newBudget = await dataService.createBudget(budgetData);
      setBudgets(prev => [...prev, newBudget]);
      return newBudget;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create budget");
      throw err;
    }
  }, []);

  const updateBudget = useCallback(
    async (id: string, updates: Partial<Budget>) => {
      try {
        const updatedBudget = await dataService.updateBudget(id, updates);
        setBudgets(prev => prev.map(b => (b.id === id ? updatedBudget : b)));
        return updatedBudget;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update budget"
        );
        throw err;
      }
    },
    []
  );

  const deleteBudget = useCallback(async (id: string) => {
    try {
      await dataService.deleteBudget(id);
      setBudgets(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete budget");
      throw err;
    }
  }, []);

  const deleteAllBudgets = useCallback(async () => {
    try {
      await dataService.deleteAllBudgets();
      setBudgets([]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete all budgets"
      );
      throw err;
    }
  }, []);

  const getCurrentBudget = useCallback(() => {
    const data = budgets.find(b => b.month === currentMonthAndYear);
    return data;
  }, [budgets, currentMonthAndYear]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  return (
    <BudgetsContext.Provider
      value={{
        budgets,
        loading,
        error,
        createBudget,
        updateBudget,
        deleteBudget,
        deleteAllBudgets,
        loadBudgets,
        getCurrentBudget,
      }}
    >
      {children}
    </BudgetsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useBudgets = () => {
  const context = useContext(BudgetsContext);
  if (context === undefined) {
    throw new Error("useBudgets must be used within a BudgetsProvider");
  }
  return context;
};
