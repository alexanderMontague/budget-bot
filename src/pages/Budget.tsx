import { useState, useEffect } from "react";
import { useCategories, useBudgets } from "../hooks/useData";

export default function Budget() {
  const { categories } = useCategories();
  const { budgets, updateBudget } = useBudgets();
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [availableToBudget, setAvailableToBudget] = useState(0);

  const currentMonth = "2025-09";
  const currentBudget = budgets.find(b => b.month === currentMonth);

  // Initialize state when budget data loads
  useEffect(() => {
    if (currentBudget) {
      setAllocations(currentBudget.allocations);
      setAvailableToBudget(currentBudget.availableToBudget);
    }
  }, [currentBudget]);

  const totalAllocated = Object.values(allocations).reduce(
    (sum, amount) => sum + amount,
    0
  );

  const handleAllocationChange = async (categoryId: string, amount: number) => {
    const oldAmount = allocations[categoryId] || 0;
    const difference = amount - oldAmount;

    if (availableToBudget - difference >= 0) {
      const newAllocations = {
        ...allocations,
        [categoryId]: amount,
      };
      const newAvailableToBudget = availableToBudget - difference;

      setAllocations(newAllocations);
      setAvailableToBudget(newAvailableToBudget);

      // Save to storage
      if (currentBudget) {
        try {
          await updateBudget(currentBudget.id, {
            allocations: newAllocations,
            availableToBudget: newAvailableToBudget,
          });
        } catch (error) {
          console.error("Failed to save budget changes:", error);
          // Revert changes on error
          setAllocations(allocations);
          setAvailableToBudget(availableToBudget);
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="heading-2">Budget Allocation</h1>
        <button className="btn-primary">Save Changes</button>
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
                      <p className="text-sm text-gray-500">Last Month</p>
                      <p className="font-medium">
                        ${category.monthlyBudget?.toFixed(2) || "0.00"}
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
                      onClick={() =>
                        handleAllocationChange(
                          category.id,
                          category.monthlyBudget || 0
                        )
                      }
                      className="text-xs text-primary-600 hover:text-primary-700 px-2 py-1 rounded whitespace-nowrap"
                    >
                      Use Last
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
            // const totalBudget = Object.values(mockBudget.allocations).reduce((sum, amount) => sum + amount, 0)
            const remaining = availableToBudget + totalAllocated;
            const newAllocations: Record<string, number> = {};

            categories.forEach(category => {
              newAllocations[category.id] = category.monthlyBudget || 0;
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
          Use Last Month's Budget
        </button>

        <button
          onClick={async () => {
            const remaining = availableToBudget + totalAllocated;
            setAllocations({});
            setAvailableToBudget(remaining);

            // Save to storage
            if (currentBudget) {
              try {
                await updateBudget(currentBudget.id, {
                  allocations: {},
                  availableToBudget: remaining,
                });
              } catch (error) {
                console.error("Failed to save budget changes:", error);
              }
            }
          }}
          className="btn-secondary"
        >
          Clear All Allocations
        </button>

        <button
          onClick={async () => {
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

            // Save to storage
            if (currentBudget) {
              try {
                await updateBudget(currentBudget.id, {
                  allocations: newAllocations,
                  availableToBudget: newAvailableToBudget,
                });
              } catch (error) {
                console.error("Failed to save budget changes:", error);
              }
            }
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
