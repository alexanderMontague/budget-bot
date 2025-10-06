import { useState } from "react";
import { useTransactions } from "../hooks/useTransactions";
import { useBudgets } from "../hooks/useBudgets";
import { useCategories } from "../hooks/useCategories";
import { dataService } from "../services/dataService";
import AddCategoryModal from "../components/AddCategoryModal";
import TransactionUpload from "../components/TransactionUpload";
import type { Category } from "../types";

export default function Settings() {
  const {
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
    deleteAllCategories,
  } = useCategories();
  const { deleteAllBudgets } = useBudgets();
  const { deleteAllTransactions } = useTransactions();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(
    undefined
  );
  const [showTransactionUpload, setShowTransactionUpload] = useState(false);

  const handleSaveCategory = async (categoryData: {
    name: string;
    monthlyBudget: number;
    color: string;
  }) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData);
      } else {
        await createCategory(categoryData);
      }
      setEditingCategory(undefined);
    } catch {
      alert(
        `Failed to ${
          editingCategory ? "update" : "add"
        } category. Please try again.`
      );
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(undefined);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this category? This action cannot be undone."
      )
    ) {
      try {
        await deleteCategory(categoryId);
      } catch {
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
            onClick={() => setShowCategoryModal(true)}
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
                <button
                  onClick={() => handleEditCategory(category)}
                  className="text-primary-600 hover:text-primary-700 px-2 py-1 text-sm"
                >
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
          <button
            className="btn-secondary"
            onClick={() => setShowTransactionUpload(true)}
          >
            📥 Import Transactions
          </button>
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
          <button
            className="btn-danger"
            onClick={() =>
              confirm("Are you sure you want to delete all transactions?") &&
              deleteAllTransactions()
            }
          >
            🗑️ Clear Transactions Data
          </button>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={async () => {
              if (confirm("Are you sure you want to delete all data?")) {
                await Promise.all([
                  deleteAllCategories(),
                  deleteAllBudgets(),
                  deleteAllTransactions(),
                ]);
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

      <AddCategoryModal
        isOpen={showCategoryModal}
        onClose={handleCloseCategoryModal}
        onSubmit={handleSaveCategory}
        category={editingCategory}
      />

      <TransactionUpload
        isOpen={showTransactionUpload}
        onClose={() => setShowTransactionUpload(false)}
      />
    </div>
  );
}
