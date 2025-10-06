import { useState, useEffect } from "react";
import type { Category } from "../types";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (categoryData: {
    name: string;
    monthlyBudget: number;
    color: string;
  }) => void;
  category?: Category;
}

const COLOR_OPTIONS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#06b6d4",
  "#10b981",
];

export default function AddCategoryModal({
  isOpen,
  onClose,
  onSubmit,
  category,
}: AddCategoryModalProps) {
  const [name, setName] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setMonthlyBudget(category.monthlyBudget?.toString() || "");
      setSelectedColor(category.color || COLOR_OPTIONS[0]);
    } else {
      setName("");
      setMonthlyBudget("");
      setSelectedColor(COLOR_OPTIONS[0]);
    }
  }, [category, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter a category name");
      return;
    }

    onSubmit({
      name: name.trim(),
      monthlyBudget: parseFloat(monthlyBudget) || 0,
      color: selectedColor,
    });

    // Reset form
    setName("");
    setMonthlyBudget("");
    setSelectedColor(COLOR_OPTIONS[0]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3 className="heading-4 mb-4">
          {category ? "Edit Category" : "Add Category"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Travel"
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Monthly Budget
            </label>
            <input
              type="number"
              value={monthlyBudget}
              onChange={e => setMonthlyBudget(e.target.value)}
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
              {COLOR_OPTIONS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color
                      ? "border-gray-800"
                      : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-primary">
              {category ? "Update Category" : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
