import { useBudgets } from "../hooks/useBudgets";
import { useDate } from "../hooks/useDate";
import { useCategories } from "../hooks/useCategories";
import { useTransactions } from "../hooks/useTransactions";

import type { CategoryProgress, Category, Budget, Transaction } from "../types";
import { useNavigate } from "react-router-dom";

function calculateCategoryProgress(
  categories: Category[],
  currentBudget: Budget,
  transactions: Transaction[],
  currentMonth: string
): CategoryProgress[] {
  if (!currentBudget) {
    return categories.map(category => ({
      category,
      budgeted: 0,
      spent: 0,
      remaining: 0,
      isOverspent: false,
    }));
  }

  return categories.map(category => {
    const budgeted = currentBudget.allocations[category.id] || 0;

    // Calculate spent amount from transactions for this month
    const spent = Math.abs(
      transactions
        .filter(
          t =>
            t.categoryId === category.id &&
            t.date.startsWith(currentMonth) &&
            t.amount < 0 // Only count expenses
        )
        .reduce((sum, t) => sum + t.amount, 0)
    );

    const remaining = budgeted - spent;

    return {
      category,
      budgeted,
      spent,
      remaining,
      isOverspent: remaining < 0,
    };
  });
}

export default function Dashboard() {
  const { categories, loading: categoriesLoading } = useCategories();
  const { loading: budgetsLoading, getCurrentBudget } = useBudgets();
  const { transactions, loading: transactionsLoading } = useTransactions();
  const currentBudget = getCurrentBudget();
  const { currentMonthAndYearTitle, currentMonthAndYear } = useDate();
  const navigate = useNavigate();

  const loading = categoriesLoading || budgetsLoading || transactionsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!currentBudget) {
    return (
      <div className="flex items-center flex-col justify-center min-h-64">
        <div className="text-lg text-gray-500">
          No budget found for {currentMonthAndYearTitle}
        </div>
        <div className="mt-4">
          <button
            className="btn-primary"
            onClick={() => {
              navigate("/budget");
            }}
          >
            Create Budget
          </button>
        </div>
      </div>
    );
  }

  const categoryProgress = calculateCategoryProgress(
    categories,
    currentBudget,
    transactions,
    currentMonthAndYear
  );
  const totalBudgeted = currentBudget
    ? Object.values(currentBudget.allocations).reduce(
        (sum, amount) => sum + amount,
        0
      )
    : 0;
  const totalSpent = categoryProgress.reduce((sum, cp) => sum + cp.spent, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="heading-2">{currentMonthAndYearTitle}</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-primary-600 font-semibold">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Available to Budget
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ${currentBudget?.availableToBudget?.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                <span className="text-success-600 font-semibold">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Total Budgeted
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalBudgeted.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-danger-100 rounded-lg flex items-center justify-center">
                <span className="text-danger-600 font-semibold">💸</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalSpent.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Progress */}
      <div className="card">
        <h2 className="heading-4 mb-4">Category Progress</h2>
        <div className="space-y-4">
          {categoryProgress.map(
            ({ category, budgeted, spent, remaining, isOverspent }) => {
              const progressPercentage =
                budgeted > 0 ? Math.min((spent / budgeted) * 100, 100) : 0;

              return (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium text-gray-900 truncate">
                        {category.name}
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm text-gray-500 block">
                        ${spent.toFixed(2)} / ${budgeted.toFixed(2)}
                      </span>
                      {isOverspent && (
                        <span className="badge-danger mt-1 inline-block">
                          Over by ${Math.abs(remaining).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={
                        isOverspent ? "progress-fill-danger" : "progress-fill"
                      }
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
