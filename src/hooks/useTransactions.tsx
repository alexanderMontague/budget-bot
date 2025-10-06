import { createContext, useContext } from "react";
import { type TransactionsContextType } from "../contexts/Transactions";

export const TransactionsContext = createContext<
  TransactionsContextType | undefined
>(undefined);

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error(
      "useTransactions must be used within a TransactionsProvider"
    );
  }
  return context;
};
