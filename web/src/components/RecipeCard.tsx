import type { Recipe } from "../data/types";
import { CATEGORY_INFO } from "../data/types";
import { formatTime } from "../lib/recipeHelpers";

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSelect: (id: string) => void;
}

export default function RecipeCard({
  recipe,
  isFavorite,
  onToggleFavorite,
  onSelect,
}: RecipeCardProps) {
  const catInfo = CATEGORY_INFO[recipe.category];
  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <div
      className="relative rounded-xl p-4 cursor-pointer transition-all hover:shadow-md"
      style={{
        background: "var(--panel)",
        border: "1px solid var(--line)",
      }}
      onClick={() => onSelect(recipe.id)}
    >
      {/* Favorite button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(recipe.id);
        }}
        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full cursor-pointer"
        style={{
          background: isFavorite ? "var(--warning)" : "var(--panel)",
          border: `1px solid ${isFavorite ? "var(--warning)" : "var(--line)"}`,
          color: isFavorite ? "#fff" : "var(--muted)",
        }}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <svg className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      </button>

      {/* Category badge */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            background: catInfo.color + "20",
            color: catInfo.color,
          }}
        >
          {catInfo.emoji} {catInfo.label}
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
            color: "var(--muted)",
          }}
        >
          {recipe.difficulty}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base font-bold mb-2 pr-8" style={{ color: "var(--ink)" }}>
        {recipe.name}
      </h3>

      {/* Meta row */}
      <div className="flex items-center gap-3 text-xs" style={{ color: "var(--muted)" }}>
        <span>
          {formatTime(totalTime)} total
        </span>
        <span>{recipe.servings} servings</span>
        <span>{recipe.ingredients.length} ingredients</span>
      </div>

      {/* Tags */}
      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {recipe.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ background: "var(--line)", color: "var(--muted)" }}
            >
              {tag}
            </span>
          ))}
          {recipe.tags.length > 3 && (
            <span className="text-[10px] px-1.5 py-0.5" style={{ color: "var(--muted)" }}>
              +{recipe.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
