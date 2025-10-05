import { useState, useEffect, useCallback } from "react";
import { dataService } from "../services/dataService";
import type { Transaction } from "../types";
import { generateTransactionHash } from "../util";

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dataService.getTransactions();
      setTransactions(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load transactions"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const createTransactions = useCallback(
    async (
      transactionsData: Array<
        Omit<Transaction, "id" | "createdAt" | "updatedAt">
      >
    ) => {
      try {
        const newTransactions = await dataService.createTransactions(
          transactionsData.map(tx => ({
            ...tx,
            transactionHash: generateTransactionHash(tx),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }))
        );
        setTransactions(prev => [...prev, ...newTransactions]);
        return newTransactions;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create transactions"
        );
        throw err;
      }
    },
    []
  );

  const updateTransaction = useCallback(
    async (id: string, updates: Partial<Transaction>) => {
      try {
        const updatedTransaction = await dataService.updateTransaction(id, {
          ...updates,
          updatedAt: new Date().toISOString(),
        });
        setTransactions(prev =>
          prev.map(t => (t.id === id ? updatedTransaction : t))
        );
        return updatedTransaction;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update transaction"
        );
        throw err;
      }
    },
    []
  );

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      await dataService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete transaction"
      );
      throw err;
    }
  }, []);

  const deleteAllTransactions = useCallback(async () => {
    try {
      await dataService.deleteAllTransactions();
      setTransactions([]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete all transactions"
      );
      throw err;
    }
  }, []);

  const getTransactionsByMonth = useCallback(
    (month: string) => {
      return transactions.filter(t => t.date.startsWith(month));
    },
    [transactions]
  );

  const getTransactionsByCategory = useCallback(
    (categoryId: string) => {
      return transactions.filter(t => t.categoryId === categoryId);
    },
    [transactions]
  );

  const getTransactionsByAccount = useCallback(
    (accountType: string) => {
      return transactions.filter(t => t.accountType === accountType);
    },
    [transactions]
  );

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  return {
    transactions,
    loading,
    error,
    createTransactions,
    updateTransaction,
    deleteTransaction,
    deleteAllTransactions,
    loadTransactions,
    getTransactionsByMonth,
    getTransactionsByCategory,
    getTransactionsByAccount,
  };
};
