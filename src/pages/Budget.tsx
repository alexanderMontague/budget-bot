import { useState, useEffect, useCallback } from "react";
import { useBudgets } from "../hooks/useBudgets";
import { useCategories } from "../hooks/useCategories";
import { useDate } from "../hooks/useDate";

export default function Budget() {
  const { categories, loading: categoriesLoading } = useCategories();
  const {
    budgets,
    getCurrentBudget,
    createBudget,
    updateBudget,
    loading: budgetsLoading,
  } = useBudgets();
  const { currentMonthAndYear, currentMonthAndYearTitle } = useDate();

  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [availableToBudget, setAvailableToBudget] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentBudget = getCurrentBudget();
  const loading = categoriesLoading || budgetsLoading;

  // Get previous month's budget for initialization
  const getPreviousMonthBudget = useCallback(() => {
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() - 1);
    const previousMonth = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}`;
    return budgets.find(b => b.month === previousMonth);
  }, [budgets]);

  // Initialize allocations when data is loaded
  useEffect(() => {
    if (loading || isInitialized) return;

    if (currentBudget) {
      // Use existing budget
      setAllocations(currentBudget.allocations);
      setAvailableToBudget(currentBudget.availableToBudget);
    } else {
      // Initialize new budget
      const previousBudget = getPreviousMonthBudget();
      const initialAllocations: Record<string, number> = {};

      categories.forEach(category => {
        if (
          previousBudget &&
          previousBudget.allocations[category.id] !== undefined
        ) {
          // Use previous month's allocation
          initialAllocations[category.id] =
            previousBudget.allocations[category.id];
        } else {
          // Use category's default monthly budget
          initialAllocations[category.id] = category.monthlyBudget || 0;
        }
      });

      setAllocations(initialAllocations);
      // Start with 0 available to budget for new budgets
      setAvailableToBudget(0);
    }

    setIsInitialized(true);
  }, [
    categories,
    currentBudget,
    budgets,
    loading,
    isInitialized,
    getPreviousMonthBudget,
  ]);

  const totalAllocated = Object.values(allocations).reduce(
    (sum, amount) => sum + amount,
    0
  );

  const handleAllocationChange = (categoryId: string, amount: number) => {
    const oldAmount = allocations[categoryId] || 0;
    const difference = amount - oldAmount;

    if (availableToBudget - difference >= 0) {
      setAllocations(prev => ({
        ...prev,
        [categoryId]: amount,
      }));
      setAvailableToBudget(prev => prev - difference);
    }
  };

  const handleSaveBudget = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      if (currentBudget) {
        // Update existing budget
        await updateBudget(currentBudget.id, {
          allocations,
          availableToBudget,
        });
      } else {
        // Create new budget
        await createBudget({
          month: currentMonthAndYear,
          allocations,
          availableToBudget,
        });
      }
    } catch (error) {
      console.error("Failed to save budget:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="heading-2">Budget Allocation</h1>
        <div className="flex flex-col">
          {categories.length ? (
            <>
              <span className="text-sm text-gray-500">
                {currentBudget ? "Editing" : "Creating"} budget for{" "}
                {currentMonthAndYearTitle}
              </span>
              <button
                className="btn-primary"
                onClick={handleSaveBudget}
                disabled={isSaving}
              >
                {isSaving
                  ? "Saving..."
                  : currentBudget
                  ? "Save Changes"
                  : "Create Budget"}
              </button>
            </>
          ) : (
            <span className="text-sm text-danger-500">
              Create budget categories first
            </span>
          )}
        </div>
      </div>

      {/* Available to Budget */}
      <div className="card">
        <div className="text-center py-6">
          <h2 className="text-lg font-medium text-gray-500">
            Available to Budget
          </h2>
          <p className="text-4xl font-bold text-primary-600 mt-2">
            ${availableToBudget.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Total Allocated: ${totalAllocated.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Category Allocations */}
      <div className="card">
        <h2 className="heading-4 mb-4">Category Budgets</h2>
        <div className="space-y-4">
          {categories.map(category => {
            const currentAmount = allocations[category.id] || 0;

            return (
              <div
                key={category.id}
                className="py-3 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium text-gray-900 truncate">
                      {category.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0">
                    <div className="text-left sm:text-right">
                      <p className="text-sm text-gray-500">
                        {getPreviousMonthBudget()?.allocations[category.id]
                          ? "Last Month"
                          : "Default"}
                      </p>
                      <p className="font-medium">
                        $
                        {(
                          getPreviousMonthBudget()?.allocations[category.id] ||
                          category.monthlyBudget ||
                          0
                        ).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={currentAmount}
                        onChange={e =>
                          handleAllocationChange(
                            category.id,
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="input w-20 sm:w-24 text-right text-sm"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const previousBudget = getPreviousMonthBudget();
                        const amount =
                          previousBudget?.allocations[category.id] ||
                          category.monthlyBudget ||
                          0;
                        handleAllocationChange(category.id, amount);
                      }}
                      className="text-xs text-primary-600 hover:text-primary-700 px-2 py-1 rounded whitespace-nowrap"
                    >
                      {getPreviousMonthBudget()?.allocations[category.id]
                        ? "Use Last"
                        : "Use Default"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <button
          onClick={() => {
            const previousBudget = getPreviousMonthBudget();
            const remaining = availableToBudget + totalAllocated;
            const newAllocations: Record<string, number> = {};

            categories.forEach(category => {
              newAllocations[category.id] =
                previousBudget?.allocations[category.id] ||
                category.monthlyBudget ||
                0;
            });

            setAllocations(newAllocations);
            setAvailableToBudget(
              remaining -
                Object.values(newAllocations).reduce(
                  (sum, amount) => sum + amount,
                  0
                )
            );
          }}
          className="btn-secondary"
        >
          {getPreviousMonthBudget()
            ? "Use Last Month's Budget"
            : "Use Category Defaults"}
        </button>

        <button
          onClick={() => {
            const remaining = availableToBudget + totalAllocated;
            setAllocations({});
            setAvailableToBudget(remaining);
          }}
          className="btn-secondary"
        >
          Clear All Allocations
        </button>

        <button
          onClick={() => {
            const remaining = availableToBudget;
            const perCategory = Math.floor(remaining / categories.length);
            const newAllocations: Record<string, number> = {};

            categories.forEach(category => {
              newAllocations[category.id] =
                (allocations[category.id] || 0) + perCategory;
            });

            const newAvailableToBudget =
              remaining - perCategory * categories.length;
            setAllocations(newAllocations);
            setAvailableToBudget(newAvailableToBudget);
          }}
          className="btn-secondary text-sm whitespace-nowrap sm:col-span-2 lg:col-span-1"
          disabled={availableToBudget <= 0 || categories.length === 0}
        >
          Distribute Remaining
        </button>
      </div>
    </div>
  );
}
