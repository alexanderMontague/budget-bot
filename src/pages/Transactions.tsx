import { useState } from "react";
import { useTransactions } from "../hooks/useTransactions";
import { useCategories } from "../hooks/useCategories";
import { useDate } from "../hooks/useDate";
import TransactionUpload from "../components/TransactionUpload";
import type { Transaction } from "../types";

export default function Transactions() {
  const { transactions, updateTransaction, deleteTransaction } =
    useTransactions();
  const { categories } = useCategories();
  const { currentMonthAndYear } = useDate();
  const [showUpload, setShowUpload] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthAndYear);
  const [editingTransaction, setEditingTransaction] = useState<string | null>(
    null
  );

  const availableMonths = Array.from(
    new Set(transactions.map(t => t.date.substring(0, 7)))
  )
    .sort()
    .reverse();

  const filteredTransactions = transactions
    .filter(t => t.date.startsWith(selectedMonth))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleCategoryChange = async (
    transactionId: string,
    categoryId: string
  ) => {
    await updateTransaction(transactionId, { categoryId });
  };

  const handleDelete = async (transactionId: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      await deleteTransaction(transactionId);
    }
  };

  const monthStats = {
    total: filteredTransactions.length,
    expenses: filteredTransactions.filter(t => t.amount < 0).length,
    income: filteredTransactions.filter(t => t.amount > 0).length,
    totalExpense: Math.abs(
      filteredTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0)
    ),
    totalIncome: filteredTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="heading-2">Transactions</h1>
        <button onClick={() => setShowUpload(true)} className="btn-primary">
          📥 Upload PDF Statement
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Transactions Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Upload your first PDF statement to get started tracking your
              spending
            </p>
            <button onClick={() => setShowUpload(true)} className="btn-primary">
              📥 Upload PDF Statement
            </button>
            <div className="mt-6 text-sm text-gray-500">
              <p>Supported formats:</p>
              <p className="font-medium mt-1">
                AMEX, CIBC, and other bank statements
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {monthStats.total}
              </p>
            </div>
            <div className="card">
              <p className="text-sm font-medium text-gray-500">Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                {monthStats.expenses}
              </p>
            </div>
            <div className="card">
              <p className="text-sm font-medium text-gray-500">Income</p>
              <p className="text-2xl font-bold text-green-600">
                {monthStats.income}
              </p>
            </div>
            <div className="card">
              <p className="text-sm font-medium text-gray-500">Total Spent</p>
              <p
                className={`text-2xl font-bold ${
                  monthStats.totalIncome - monthStats.totalExpense >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                ${(monthStats.totalIncome - monthStats.totalExpense).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="heading-4">All Transactions</h2>
              <select
                className="select"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
              >
                {availableMonths.map(month => (
                  <option key={month} value={month}>
                    {new Date(month + "-01").toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              {filteredTransactions.map(transaction => {
                const category = categories.find(
                  c => c.id === transaction.categoryId
                );
                const isEditing = editingTransaction === transaction.id;

                return (
                  <div
                    key={transaction.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
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
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()} •{" "}
                          {transaction.accountType.toUpperCase()}
                        </p>
                        {transaction.description && (
                          <p className="text-xs text-gray-400 truncate mt-1">
                            {transaction.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <select
                        className="select text-sm"
                        value={transaction.categoryId || ""}
                        onChange={e =>
                          handleCategoryChange(transaction.id, e.target.value)
                        }
                      >
                        <option value="">Uncategorized</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>

                      <div className="text-right min-w-[80px]">
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
                      </div>

                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-danger-600 hover:text-danger-700 px-2 py-1 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <TransactionUpload
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
      />
    </div>
  );
}
