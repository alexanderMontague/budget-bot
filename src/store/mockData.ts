import type { Category, Budget } from "../types";

// COMMENTED OUT: Mock data seeds for development/testing
// Keeping these here in case we need to seed data again in the future
// The app now uses localStorage for persistent data storage

// export const mockAccounts: Account[] = [
//   { id: "1", name: "Chase Checking", type: "bank", balance: 2500.0 },
//   { id: "2", name: "Amex Credit Card", type: "credit", balance: -1200.5 },
//   { id: "3", name: "Cash Wallet", type: "cash", balance: 150.0 },
// ];

export const mockCategories: Category[] = [
  { id: "1", name: "Groceries", monthlyBudget: 500, color: "#22c55e" },
  { id: "2", name: "Rent", monthlyBudget: 1200, color: "#3b82f6" },
  { id: "3", name: "Utilities", monthlyBudget: 150, color: "#f59e0b" },
  { id: "4", name: "Transportation", monthlyBudget: 200, color: "#8b5cf6" },
  { id: "5", name: "Entertainment", monthlyBudget: 150, color: "#ec4899" },
  { id: "6", name: "Dining Out", monthlyBudget: 300, color: "#ef4444" },
  { id: "7", name: "Healthcare", monthlyBudget: 100, color: "#06b6d4" },
  { id: "8", name: "Savings", monthlyBudget: 800, color: "#10b981" },
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

export const mockBudget: Budget = {
  id: "budget-2025-09",
  month: "2025-09",
  allocations: {
    "1": 500, // Groceries
    "2": 1200, // Rent
    "3": 150, // Utilities
    "4": 200, // Transportation
    "5": 150, // Entertainment
    "6": 300, // Dining Out
    "7": 100, // Healthcare
    "8": 800, // Savings
  },
  availableToBudget: 100,
};

// Helper function to seed data if needed during development
export const seedData = async () => {
  const { dataService } = await import("../services/dataService");

  try {
    // Check if data already exists
    const existingCategories = await dataService.getCategories();
    const existingBudgets = await dataService.getBudgets();

    if (existingCategories.length > 0 || existingBudgets.length > 0) {
      console.log("Data already exists, skipping seed");
      return;
    }

    // Seed categories
    console.log("Seeding categories...");
    for (const category of mockCategories) {
      await dataService.createCategory({
        name: category.name,
        monthlyBudget: category.monthlyBudget,
        color: category.color,
      });
    }

    // Seed budget
    console.log("Seeding budget...");
    await dataService.createBudget({
      month: mockBudget.month,
      allocations: mockBudget.allocations,
      availableToBudget: mockBudget.availableToBudget,
    });

    console.log("Data seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
};
