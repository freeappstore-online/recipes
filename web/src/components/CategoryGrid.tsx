import type { Category, Recipe } from "../data/types";
import { CATEGORY_INFO } from "../data/types";

const ALL_CATEGORIES: Category[] = ["breakfast", "lunch", "dinner", "dessert", "snack", "drink"];

interface CategoryGridProps {
  recipes: Recipe[];
  onSelectCategory: (cat: Category) => void;
}

export default function CategoryGrid({ recipes, onSelectCategory }: CategoryGridProps) {
  const counts = new Map<Category, number>();
  for (const r of recipes) {
    counts.set(r.category, (counts.get(r.category) ?? 0) + 1);
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {ALL_CATEGORIES.map((cat) => {
        const info = CATEGORY_INFO[cat];
        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer transition-transform hover:scale-105"
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
            }}
          >
            <span className="text-3xl">{info.emoji}</span>
            <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
              {info.label}
            </span>
            <span className="text-xs" style={{ color: "var(--muted)" }}>
              {counts.get(cat) ?? 0} recipes
            </span>
          </button>
        );
      })}
    </div>
  );
}
