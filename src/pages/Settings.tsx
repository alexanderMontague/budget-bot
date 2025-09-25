import { useState } from "react";
import { useCategories } from "../hooks/useCategories";
import { useBudgets } from "../hooks/useBudgets";
import { dataService } from "../services/dataService";

export default function Settings() {
  const { categories, deleteCategory, deleteAllCategories } = useCategories();
  const { deleteAllBudgets } = useBudgets();
  const [showAddCategory, setShowAddCategory] = useState(false);

  const handleDeleteCategory = async (categoryId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this category? This action cannot be undone."
      )
    ) {
      try {
        await deleteCategory(categoryId);
      } catch (error) {
        alert("Failed to delete category. Please try again.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="heading-2">Settings</h1>
        <button className="btn-secondary">Export All Data</button>
      </div>

      {/* Categories Section */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="heading-4">Categories</h2>
          <button
            onClick={() => setShowAddCategory(true)}
            className="btn-primary"
          >
            + Add Category
          </button>
        </div>

        <div className="space-y-3">
          {categories.map(category => (
            <div
              key={category.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div
                  className="w-6 h-6 rounded-full flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-900 truncate">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Default Budget: $
                    {category.monthlyBudget?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2 flex-shrink-0">
                <button className="text-primary-600 hover:text-primary-700 px-2 py-1 text-sm">
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-danger-600 hover:text-danger-700 px-2 py-1 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* App Settings */}
      <div className="card">
        <h2 className="heading-4 mb-4">App Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Dark Mode</h3>
              <p className="text-sm text-gray-500">Toggle dark mode theme</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Push Notifications</h3>
              <p className="text-sm text-gray-500">
                Get notified about budget alerts
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">
                Auto-categorize Transactions
              </h3>
              <p className="text-sm text-gray-500">
                Automatically assign categories to new transactions
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <h2 className="heading-4 mb-4">Data Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-secondary">📤 Export CSV</button>
          <button className="btn-secondary">📥 Import CSV</button>
          <button
            className="btn-secondary"
            onClick={async () => console.log(await dataService.exportData())}
          >
            📝 Log Data
          </button>
          <button
            className="btn-danger"
            onClick={() =>
              confirm("Are you sure you want to delete all categories?") &&
              deleteAllCategories()
            }
          >
            🗑️ Clear Categories Data
          </button>
          <button
            className="btn-danger"
            onClick={() =>
              confirm("Are you sure you want to delete all budgets?") &&
              deleteAllBudgets()
            }
          >
            🗑️ Clear Budgets Data
          </button>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete all data?")) {
                deleteAllBudgets();
                deleteAllCategories();
              }
            }}
            className="text-danger-600 hover:text-danger-700 font-medium"
          >
            🗑️ Clear All Data
          </button>
          <p className="text-sm text-gray-500 mt-1">
            This will permanently delete all transactions, categories, and
            settings.
          </p>
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3 className="heading-4 mb-4">Add Category</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Travel"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Monthly Budget
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="flex space-x-2">
                  {[
                    "#22c55e",
                    "#3b82f6",
                    "#f59e0b",
                    "#8b5cf6",
                    "#ec4899",
                    "#ef4444",
                    "#06b6d4",
                    "#10b981",
                  ].map(color => (
                    <button
                      key={color}
                      type="button"
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddCategory(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
