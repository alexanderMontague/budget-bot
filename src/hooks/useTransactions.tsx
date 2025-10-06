import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { dataService } from "../services/dataService";
import type { Transaction } from "../types";
import { generateTransactionHash } from "../util";
import { useBudgets } from "./useBudgets";
import { useCategories } from "./useCategories";

interface TransactionsContextType {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  createTransactions: (
    transactionsData: Array<Omit<Transaction, "id" | "createdAt" | "updatedAt">>
  ) => Promise<Transaction[]>;
  updateTransaction: (
    id: string,
    updates: Partial<Transaction>
  ) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  deleteAllTransactions: () => Promise<void>;
  loadTransactions: () => Promise<void>;
  getTransactionsByMonth: (month: string) => Transaction[];
  getTransactionsByCategory: (categoryId: string) => Transaction[];
  getTransactionsByAccount: (accountType: string) => Transaction[];
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(
  undefined
);

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { budgets, createBudget } = useBudgets();
  const { categories } = useCategories();

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
        const existingHashes = new Set(
          transactions.map(t => t.transactionHash)
        );

        const transactionsWithHash = await Promise.all(
          transactionsData.map(async tx => {
            const budgetMonth = `${tx.date.split("-")[0]}-${
              tx.date.split("-")[1]
            }`;
            let txBudget = budgets.find(b => b.month === budgetMonth);

            debugger;

            if (!txBudget) {
              console.warn(
                `Transaction ${tx.description} has no budget. Creating budget for month ${budgetMonth} with default`
              );
              txBudget = await createBudget({
                month: budgetMonth,
                allocations: categories.reduce((acc, category) => {
                  acc[category.id] = category.monthlyBudget || 0;
                  return acc;
                }, {} as Record<string, number>),
                availableToBudget: 0,
              });
            }

            return {
              ...tx,
              budgetId: txBudget.id,
              transactionHash: generateTransactionHash(tx),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          })
        );

        const filteredTransactions = transactionsWithHash
          .filter(tx => !!tx)
          .filter(tx => !existingHashes.has(tx.transactionHash));

        const newTransactions = await dataService.createTransactions(
          filteredTransactions
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
    [transactions, budgets]
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

  return (
    <TransactionsContext.Provider
      value={{
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
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error(
      "useTransactions must be used within a TransactionsProvider"
    );
  }
  return context;
};
