import type { Transaction } from "../types";

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const formatDateToYYYYMMDD = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

export const generateTransactionHash = (
  tx: Omit<Transaction, "id" | "transactionHash" | "createdAt" | "updatedAt">
): string => {
  const hashFn = (str: string) => {
    let hash = 0;
    for (const char of str) {
      hash = (hash << 5) - hash + char.charCodeAt(0);
      hash |= 0; // Constrain to 32bit integer
    }
    return hash.toString();
  };

  return hashFn(`${tx.date}-${tx.merchant}-${tx.amount}-${tx.description}`);
};
