import { createContext, useContext } from "react";
import { type BudgetsContextType } from "../contexts/Budgets";

export const BudgetsContext = createContext<BudgetsContextType | undefined>(
  undefined
);

export const useBudgets = () => {
  const context = useContext(BudgetsContext);
  if (context === undefined) {
    throw new Error("useBudgets must be used within a BudgetsProvider");
  }
  return context;
};
