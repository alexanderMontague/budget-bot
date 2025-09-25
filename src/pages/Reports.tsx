import { useCategories } from "../hooks/useCategories";
import { useBudgets } from "../hooks/useBudgets";

export default function Reports() {
  const { categories } = useCategories();
  const { budgets } = useBudgets();
  const currentMonth = "2025-09";

  const currentBudget = budgets.find(b => b.month === currentMonth);

  // Calculate spending by category for current month (showing 0 spent since we removed transactions)
  const categorySpending = categories
    .map(category => {
      const spent = 0; // No transactions to calculate from
      const budgeted = currentBudget?.allocations[category.id] || 0;
      const percentage = 0; // No spending to calculate percentage

      return {
        category: category.name,
        spent,
        budgeted,
        percentage,
        color: category.color || "#6b7280",
      };
    })
    .filter(item => item.budgeted > 0)
    .sort((a, b) => b.budgeted - a.budgeted); // Sort by budgeted instead of spent

  const totalSpent = 0; // No transactions
  const totalBudgeted = currentBudget
    ? Object.values(currentBudget.allocations).reduce(
        (sum, amount) => sum + amount,
        0
      )
    : 0;
  const totalIncome = 0; // No transactions

  // Recent trends (mock data for demonstration)
  const monthlyTrends = [
    { month: "Jul 2025", spent: 2650, income: 3500 },
    { month: "Aug 2025", spent: 2890, income: 3500 },
    { month: "Sep 2025", spent: totalSpent, income: totalIncome },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="heading-2">Reports & Analytics</h1>
        <div className="flex flex-col sm:flex-row gap-3 sm:space-x-3 sm:gap-0">
          <select className="select text-sm">
            <option>September 2025</option>
            <option>August 2025</option>
            <option>July 2025</option>
          </select>
          <button className="btn-secondary">Export Data</button>
        </div>
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

        {/* Monthly Trends */}
        <div className="card">
          <h2 className="heading-4 mb-4">3-Month Trend</h2>
          <div className="space-y-4">
            {monthlyTrends.map(month => {
              const savings = month.income - month.spent;
              const savingsRate = (savings / month.income) * 100;

              return (
                <div
                  key={month.month}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{month.month}</h3>
                    <p className="text-sm text-gray-500">
                      Savings: ${savings.toFixed(2)} ({savingsRate.toFixed(1)}%)
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Income</div>
                    <div className="font-semibold text-success-600">
                      ${month.income.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Spent</div>
                    <div className="font-semibold text-danger-600">
                      ${month.spent.toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}
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
