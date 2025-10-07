import { useBudgets } from "../hooks/useBudgets";
import { useCategories } from "../hooks/useCategories";
import { useTransactions } from "../hooks/useTransactions";
import { dataService } from "../services/dataService";

export default function Settings() {
  const { deleteAllCategories } = useCategories();
  const { deleteAllBudgets } = useBudgets();
  const { deleteAllTransactions } = useTransactions();

  const handleExportData = async () => {
    try {
      const data = await dataService.exportData();
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `budget-tracker-export-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data. Please try again.");
    }
  };

  const handleLogData = async () => {
    try {
      const data = await dataService.exportData();
      console.log("Data Logged:", data);
    } catch (error) {
      console.error("Log failed:", error);
      alert("Failed to log data. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="heading-2">Settings</h1>
      </div>

      <div className="card">
        <h2 className="heading-4 mb-4">Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Dark Mode</h3>
              <p className="text-sm text-gray-500">Toggle dark mode theme</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">
                Auto-categorize Transactions
              </h3>
              <p className="text-sm text-gray-500">
                Automatically assign categories to new transactions based on
                merchant names
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="heading-4 mb-4">Data Management</h2>
        <div className="flex flex-col space-y-3">
          <button
            className="btn-secondary sm:w-auto"
            onClick={handleExportData}
          >
            📤 Export All Data
          </button>
          <button className="btn-secondary sm:w-auto" onClick={handleLogData}>
            🔍 Log All Data
          </button>
          <p className="text-sm text-gray-500">
            Download all your budget data as JSON
          </p>
        </div>
      </div>

      <div className="card border-danger-200 bg-danger-50">
        <h2 className="heading-4 mb-4 text-danger-900">Danger Zone</h2>
        <div className="space-y-4">
          <div>
            <button
              className="btn-danger"
              onClick={() =>
                confirm(
                  "Are you sure you want to delete all categories? This will affect all related transactions and budgets."
                ) && deleteAllCategories()
              }
            >
              Clear All Categories
            </button>
            <p className="text-sm text-danger-700 mt-1">
              Delete all categories and unassign them from transactions
            </p>
          </div>

          <div>
            <button
              className="btn-danger"
              onClick={() =>
                confirm("Are you sure you want to delete all budgets?") &&
                deleteAllBudgets()
              }
            >
              Clear All Budgets
            </button>
            <p className="text-sm text-danger-700 mt-1">
              Delete all budget allocations for all months
            </p>
          </div>

          <div>
            <button
              className="btn-danger"
              onClick={() =>
                confirm("Are you sure you want to delete all transactions?") &&
                deleteAllTransactions()
              }
            >
              Clear All Transactions
            </button>
            <p className="text-sm text-danger-700 mt-1">
              Delete all imported transactions permanently
            </p>
          </div>

          <div className="pt-4 border-t border-danger-300">
            <button
              onClick={async () => {
                if (
                  confirm(
                    "⚠️ WARNING: This will delete ALL data including categories, budgets, and transactions. This action cannot be undone. Are you absolutely sure?"
                  )
                ) {
                  await Promise.all([
                    deleteAllCategories(),
                    deleteAllBudgets(),
                    deleteAllTransactions(),
                  ]);
                  alert("All data has been cleared.");
                }
              }}
              className="btn-danger font-bold"
            >
              🗑️ Clear ALL Data
            </button>
            <p className="text-sm text-danger-700 mt-1 font-medium">
              This will permanently delete everything: categories, budgets, and
              transactions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
