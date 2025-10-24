import { useTransactions } from "../hooks/useTransactions";
import { useBudgets } from "../hooks/useBudgets";
import { useCategories } from "../hooks/useCategories";
import { useDate } from "../hooks/useDate";
import { formatDateToHumanReadable } from "../util";
import { useState } from "react";

export default function Reports() {
  const { categories } = useCategories();
  const { budgets, getCurrentBudget } = useBudgets();
  const { getTransactionsByMonthAndYear } = useTransactions();
  const { currentMonthAndYear } = useDate();
  const [selectedMonthAndYear, setSelectedMonthAndYear] =
    useState(currentMonthAndYear);

  const currentBudget = getCurrentBudget();
  const currentMonthTransactions =
    getTransactionsByMonthAndYear(selectedMonthAndYear);

  // Calculate spending by category for current month
  const categorySpending = categories
    .map(category => {
      const categoryTransactions = currentMonthTransactions.filter(
        t => t.categoryId === category.id
      );
      const spent = Math.abs(
        categoryTransactions
          .filter(t => t.amount < 0)
          .reduce((sum, t) => sum + t.amount, 0)
      );
      const budgeted = currentBudget?.allocations[category.id] || 0;
      const percentage = budgeted > 0 ? (spent / budgeted) * 100 : 0;

      return {
        category: category.name,
        spent,
        budgeted,
        percentage,
        color: category.color || "#6b7280",
      };
    })
    .filter(item => item.budgeted > 0 || item.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  const totalSpent = Math.abs(
    currentMonthTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  );
  const totalBudgeted = currentBudget
    ? Object.values(currentBudget.allocations).reduce(
        (sum, amount) => sum + amount,
        0
      )
    : 0;
  const totalIncome = currentMonthTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="heading-2">Reports & Analytics</h1>
        {budgets.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 sm:space-x-3 sm:gap-0">
            <select
              className="select text-sm"
              value={selectedMonthAndYear}
              onChange={e => setSelectedMonthAndYear(e.target.value)}
            >
              {budgets
                .sort(
                  (a, b) =>
                    new Date(a.month).getTime() - new Date(b.month).getTime()
                )
                .map(budget => (
                  <option key={budget.id} value={budget.month}>
                    {formatDateToHumanReadable(budget.month)}
                  </option>
                ))}
            </select>
            <button className="btn-secondary">Export Data</button>
          </div>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                <span className="text-success-600 font-semibold">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Income</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalIncome.toFixed(2)}
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

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-primary-600 font-semibold">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Savings Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalIncome > 0
                  ? (((totalIncome - totalSpent) / totalIncome) * 100).toFixed(
                      1
                    )
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                <span className="text-warning-600 font-semibold">⚡</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Budget Usage</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalBudgeted > 0
                  ? ((totalSpent / totalBudgeted) * 100).toFixed(1)
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <div className="card">
          <h2 className="heading-4 mb-4">Spending by Category</h2>
          <div className="space-y-4">
            {categorySpending.map((item, index) => (
              <div key={item.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span className="text-sm sm:text-lg font-bold text-gray-400">
                        #{index + 1}
                      </span>
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                    <span className="font-medium text-gray-900 truncate text-sm sm:text-base">
                      {item.category}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">
                      ${item.spent.toFixed(2)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      {item.percentage.toFixed(1)}% of budget
                    </div>
                  </div>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(item.percentage, 100)}%`,
                      backgroundColor:
                        item.percentage > 100 ? "#ef4444" : item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transactions */}
        <div className="card overflow-y-scroll max-h-[60vh]">
          <h2 className="heading-4 mb-4">Transactions</h2>
          <div className="space-y-3">
            {currentMonthTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📄</div>
                <p>No transactions imported yet</p>
                <p className="text-sm mt-1">
                  Go to Settings to import PDF statements
                </p>
              </div>
            ) : (
              <>
                {currentMonthTransactions
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  )
                  .map(transaction => {
                    const category = categories.find(
                      c => c.id === transaction.categoryId
                    );
                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: category?.color || "#6b7280",
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">
                              {transaction.merchant}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {transaction.date} •{" "}
                              {category?.name || "Uncategorized"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p
                            className={`font-semibold ${
                              transaction.amount < 0
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {transaction.amount < 0 ? "-" : "+"}$
                            {Math.abs(transaction.amount).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 uppercase">
                            {transaction.accountType}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="card">
        <h2 className="heading-4 mb-4">Insights & Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-success-50 rounded-lg border border-success-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-success-600 text-xl">✅</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-success-800">
                  Great Job!
                </h3>
                <p className="text-sm text-success-700">
                  You're staying within budget for most categories this month.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-warning-50 rounded-lg border border-warning-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-warning-600 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-warning-800">
                  Watch Out
                </h3>
                <p className="text-sm text-warning-700">
                  Entertainment spending is 20% higher than last month.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-primary-600 text-xl">💡</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-primary-800">Tip</h3>
                <p className="text-sm text-primary-700">
                  Consider increasing your savings allocation by $200/month.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-purple-600 text-xl">🎯</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-purple-800">
                  Goal Progress
                </h3>
                <p className="text-sm text-purple-700">
                  You're on track to save $9,600 this year!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
