import { useState } from "react";
import type { ShoppingItem } from "../data/types";
import { formatAmount } from "../lib/recipeHelpers";

interface ShoppingListProps {
  items: ShoppingItem[];
  onUpdateItems: (items: ShoppingItem[]) => void;
  onBack: () => void;
}

export default function ShoppingList({ items, onUpdateItems, onBack }: ShoppingListProps) {
  const [customItemName, setCustomItemName] = useState("");

  const toggleItem = (index: number) => {
    const next = items.map((item, i) =>
      i === index ? { ...item, checked: !item.checked } : item,
    );
    onUpdateItems(next);
  };

  const addCustomItem = () => {
    if (!customItemName.trim()) return;
    const next: ShoppingItem[] = [
      ...items,
      { name: customItemName.trim(), amount: 0, unit: "", checked: false, isCustom: true },
    ];
    onUpdateItems(next);
    setCustomItemName("");
  };

  const clearChecked = () => {
    onUpdateItems(items.filter((item) => !item.checked));
  };

  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm font-medium cursor-pointer mb-1"
            style={{ color: "var(--accent)", background: "none", border: "none" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Planner
          </button>
          <h2 className="text-xl font-bold" style={{ color: "var(--ink)" }}>
            Shopping List
          </h2>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            {items.length} items · {checkedCount} checked
          </p>
        </div>
        {checkedCount > 0 && (
          <button
            onClick={clearChecked}
            className="text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer"
            style={{ background: "none", border: "1px solid var(--error)", color: "var(--error)" }}
          >
            Clear Checked
          </button>
        )}
      </div>

      {/* Add custom item */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={customItemName}
          onChange={(e) => setCustomItemName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addCustomItem();
          }}
          placeholder="Add custom item..."
          className="flex-1 px-3 py-2 text-sm rounded-lg outline-none"
          style={{ background: "var(--panel)", border: "1px solid var(--line)", color: "var(--ink)" }}
        />
        <button
          onClick={addCustomItem}
          disabled={!customItemName.trim()}
          className="px-4 py-2 text-sm font-medium rounded-lg cursor-pointer"
          style={{
            background: customItemName.trim() ? "var(--accent)" : "var(--panel)",
            color: customItemName.trim() ? "#fff" : "var(--muted)",
            border: "none",
          }}
        >
          Add
        </button>
      </div>

      {/* Items list */}
      {items.length === 0 ? (
        <div className="text-center py-12 rounded-xl" style={{ background: "var(--panel)" }}>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Shopping list is empty. Plan some meals first!
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {/* Unchecked items first */}
          {items
            .map((item, originalIndex) => ({ item, originalIndex }))
            .sort((a, b) => {
              if (a.item.checked !== b.item.checked) return a.item.checked ? 1 : -1;
              return 0;
            })
            .map(({ item, originalIndex }) => (
              <label
                key={originalIndex}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
                style={{
                  background: item.checked ? "var(--panel)" : "transparent",
                }}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleItem(originalIndex)}
                  className="w-4 h-4 rounded accent-[var(--accent)]"
                />
                <span
                  className="text-sm flex-1"
                  style={{
                    color: item.checked ? "var(--muted)" : "var(--ink)",
                    textDecoration: item.checked ? "line-through" : "none",
                  }}
                >
                  {item.isCustom ? (
                    item.name
                  ) : (
                    <>
                      <strong>{formatAmount(item.amount)} {item.unit}</strong> {item.name}
                    </>
                  )}
                </span>
              </label>
            ))}
        </div>
      )}
    </div>
  );
}
