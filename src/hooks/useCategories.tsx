import { createContext, useContext } from "react";
import { type CategoriesContextType } from "../contexts/Categories";

export const CategoriesContext = createContext<
  CategoriesContextType | undefined
>(undefined);

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error("useCategories must be used within a CategoriesProvider");
  }
  return context;
};
