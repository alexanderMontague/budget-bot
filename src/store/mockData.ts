import type { Category } from "../types";
import { dataService } from "../services/dataService";
import { generateId } from "../util";

// export const mockAccounts: Account[] = [
//   { id: "1", name: "Chase Checking", type: "bank", balance: 2500.0 },
//   { id: "2", name: "Amex Credit Card", type: "credit", balance: -1200.5 },
//   { id: "3", name: "Cash Wallet", type: "cash", balance: 150.0 },
// ];

export const initialCategories: Category[] = [
  { id: generateId(), name: "Groceries", monthlyBudget: 500, color: "#22c55e" },
  { id: generateId(), name: "Mortgage", monthlyBudget: 1200, color: "#3b82f6" },
  { id: generateId(), name: "Utilities", monthlyBudget: 150, color: "#f59e0b" },
  {
    id: generateId(),
    name: "Transportation",
    monthlyBudget: 200,
    color: "#8b5cf6",
  },
  {
    id: generateId(),
    name: "Entertainment",
    monthlyBudget: 150,
    color: "#ec4899",
  },
  {
    id: generateId(),
    name: "Dining Out",
    monthlyBudget: 300,
    color: "#ef4444",
  },
  {
    id: generateId(),
    name: "Healthcare",
    monthlyBudget: 100,
    color: "#06b6d4",
  },
  { id: generateId(), name: "Savings", monthlyBudget: 800, color: "#10b981" },
];

// export const mockTransactions: Transaction[] = [
//   {
//     id: "1",
//     date: "2025-09-18",
//     merchant: "Whole Foods Market",
//     amount: -89.45,
//     categoryId: "1",
//     accountId: "2",
//     description: "Weekly groceries",
//   },
//   {
//     id: "2",
//     date: "2025-09-17",
//     merchant: "Shell Gas Station",
//     amount: -45.2,
//     categoryId: "4",
//     accountId: "2",
//     description: "Gas fill-up",
//   },
//   {
//     id: "3",
//     date: "2025-09-16",
//     merchant: "Netflix",
//     amount: -15.99,
//     categoryId: "5",
//     accountId: "2",
//     description: "Monthly subscription",
//   },
//   {
//     id: "4",
//     date: "2025-09-15",
//     merchant: "Chipotle",
//     amount: -12.5,
//     categoryId: "6",
//     accountId: "2",
//     description: "Lunch",
//   },
//   {
//     id: "5",
//     date: "2025-09-14",
//     merchant: "Payroll Deposit",
//     amount: 3500.0,
//     categoryId: "8",
//     accountId: "1",
//     description: "Bi-weekly salary",
//   },
//   {
//     id: "6",
//     date: "2025-09-13",
//     merchant: "Target",
//     amount: -67.89,
//     categoryId: "1",
//     accountId: "2",
//     description: "Household supplies",
//   },
//   {
//     id: "7",
//     date: "2025-09-12",
//     merchant: "Starbucks",
//     amount: -5.4,
//     categoryId: "6",
//     accountId: "2",
//     description: "Morning coffee",
//   },
//   {
//     id: "8",
//     date: "2025-09-11",
//     merchant: "Uber",
//     amount: -18.75,
//     categoryId: "4",
//     accountId: "2",
//     description: "Ride to airport",
//   },
// ];

// export const mockBudget: Budget = {
//   id: "budget-2025-09",
//   month: "2025-09",
//   allocations: {
//     [generateId()]: 500, // Groceries
//     [generateId()]: 1200, // Rent
//     [generateId()]: 150, // Utilities
//     [generateId()]: 200, // Transportation
//     [generateId()]: 150, // Entertainment
//     [generateId()]: 300, // Dining Out
//     [generateId()]: 100, // Healthcare
//     [generateId()]: 800, // Savings
//   },
//   availableToBudget: 100,
// };

// Helper function to seed data if needed during development
export const seedData = async () => {
  try {
    // Check if data already exists
    const existingCategories = await dataService.getCategories();
    // const existingBudgets = await dataService.getBudgets();

    // Seed categories
    if (existingCategories.length === 0) {
      console.log("Seeding categories...");
      for (const category of initialCategories) {
        await dataService.createCategory({
          name: category.name,
          monthlyBudget: category.monthlyBudget,
          color: category.color,
        });
      }
    }

    // Seed budget
    // if (existingBudgets.length === 0) {
    //   console.log("Seeding budget...");
    //   await dataService.createBudget({
    //     month: mockBudget.month,
    //     allocations: mockBudget.allocations,
    //     availableToBudget: mockBudget.availableToBudget,
    //   });
    // }

    console.log("Data seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
};
