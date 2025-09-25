import { useState, useEffect, useCallback } from "react";
import { dataService } from "../services/dataService";
import type { Category } from "../types";

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

  const deleteAllCategories = useCallback(async () => {
    try {
      await dataService.deleteAllCategories();
      setCategories([]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete all categories"
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
    deleteAllCategories,
    loadCategories,
  };
};
