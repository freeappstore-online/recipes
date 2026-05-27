import type { Category, Difficulty, Tag } from "../data/types";
import { CATEGORY_INFO, TAG_LABELS } from "../data/types";

const ALL_CATEGORIES: Category[] = ["breakfast", "lunch", "dinner", "dessert", "snack", "drink"];
const ALL_DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];
const ALL_TAGS: Tag[] = [
  "vegetarian", "vegan", "gluten-free", "quick", "dairy-free",
  "high-protein", "low-carb", "comfort-food", "healthy", "meal-prep",
];

interface FilterBarProps {
  selectedCategory: Category | null;
  selectedTags: Set<Tag>;
  selectedDifficulty: Difficulty | null;
  maxTime: number | null;
  showFavoritesOnly: boolean;
  onCategoryChange: (cat: Category | null) => void;
  onTagToggle: (tag: Tag) => void;
  onDifficultyChange: (diff: Difficulty | null) => void;
  onMaxTimeChange: (time: number | null) => void;
  onFavoritesToggle: () => void;
  onClearAll: () => void;
}

export default function FilterBar({
  selectedCategory,
  selectedTags,
  selectedDifficulty,
  maxTime,
  showFavoritesOnly,
  onCategoryChange,
  onTagToggle,
  onDifficultyChange,
  onMaxTimeChange,
  onFavoritesToggle,
  onClearAll,
}: FilterBarProps) {
  const hasFilters =
    selectedCategory !== null ||
    selectedTags.size > 0 ||
    selectedDifficulty !== null ||
    maxTime !== null ||
    showFavoritesOnly;

  return (
    <div className="space-y-3">
      {/* Row 1: Category + Difficulty + Time + Favorites */}
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={selectedCategory ?? ""}
          onChange={(e) =>
            onCategoryChange(e.target.value ? (e.target.value as Category) : null)
          }
          className="text-xs px-3 py-1.5 rounded-lg"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
            color: "var(--ink)",
          }}
        >
          <option value="">All Categories</option>
          {ALL_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_INFO[cat].emoji} {CATEGORY_INFO[cat].label}
            </option>
          ))}
        </select>

        <select
          value={selectedDifficulty ?? ""}
          onChange={(e) =>
            onDifficultyChange(e.target.value ? (e.target.value as Difficulty) : null)
          }
          className="text-xs px-3 py-1.5 rounded-lg"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
            color: "var(--ink)",
          }}
        >
          <option value="">Any Difficulty</option>
          {ALL_DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={maxTime?.toString() ?? ""}
          onChange={(e) =>
            onMaxTimeChange(e.target.value ? Number(e.target.value) : null)
          }
          className="text-xs px-3 py-1.5 rounded-lg"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
            color: "var(--ink)",
          }}
        >
          <option value="">Any Time</option>
          <option value="15">Under 15 min</option>
          <option value="30">Under 30 min</option>
          <option value="45">Under 45 min</option>
          <option value="60">Under 1 hour</option>
        </select>

        <button
          onClick={onFavoritesToggle}
          className="text-xs px-3 py-1.5 rounded-lg cursor-pointer"
          style={{
            background: showFavoritesOnly ? "var(--warning)" : "var(--panel)",
            border: `1px solid ${showFavoritesOnly ? "var(--warning)" : "var(--line)"}`,
            color: showFavoritesOnly ? "#fff" : "var(--ink)",
          }}
        >
          {showFavoritesOnly ? "★ Favorites" : "☆ Favorites"}
        </button>

        {hasFilters && (
          <button
            onClick={onClearAll}
            className="text-xs px-3 py-1.5 rounded-lg cursor-pointer"
            style={{
              background: "none",
              border: "1px solid var(--error)",
              color: "var(--error)",
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Row 2: Tags */}
      <div className="flex flex-wrap gap-1.5">
        {ALL_TAGS.map((tag) => {
          const active = selectedTags.has(tag);
          return (
            <button
              key={tag}
              onClick={() => onTagToggle(tag)}
              className="text-xs px-2.5 py-1 rounded-full cursor-pointer transition-colors"
              style={{
                background: active ? "var(--accent)" : "var(--panel)",
                border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`,
                color: active ? "#fff" : "var(--muted)",
              }}
            >
              {TAG_LABELS[tag]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
