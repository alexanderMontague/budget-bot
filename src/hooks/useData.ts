import { useState, useEffect, useCallback } from "react";
import { dataService } from "../services/dataService";
import type { Category, Budget } from "../types";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dataService.getCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load categories"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(
    async (categoryData: Omit<Category, "id">) => {
      try {
        const newCategory = await dataService.createCategory(categoryData);
        setCategories(prev => [...prev, newCategory]);
        return newCategory;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create category"
        );
        throw err;
      }
    },
    []
  );

  const updateCategory = useCallback(
    async (id: string, updates: Partial<Category>) => {
      try {
        const updatedCategory = await dataService.updateCategory(id, updates);
        setCategories(prev =>
          prev.map(c => (c.id === id ? updatedCategory : c))
        );
        return updatedCategory;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update category"
        );
        throw err;
      }
    },
    []
  );

  const deleteCategory = useCallback(async (id: string) => {
    try {
      await dataService.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete category"
      );
      throw err;
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refresh: loadCategories,
  };
};

export const useBudgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  return {
    budgets,
    loading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
    refresh: loadBudgets,
  };
};
